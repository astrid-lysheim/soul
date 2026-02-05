#!/usr/bin/env python3
"""
Entity Resolver - Semantic deduplication using embeddings
Uses the same approach as Astrid's memory system (embeddinggemma-300M or similar)

Usage:
    python entity_resolver.py --input data.csv --column "hotel_name" --threshold 0.85
    python entity_resolver.py --input data.csv --column "hotel_name" --output groups.json
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Optional
import numpy as np

# Use sentence-transformers (stable, MPS support on Apple Silicon)
try:
    from sentence_transformers import SentenceTransformer
    print("Using sentence-transformers (MPS accelerated on Apple Silicon)")
except ImportError:
    print("ERROR: Need sentence-transformers")
    print("Install with: uv pip install sentence-transformers")
    sys.exit(1)

USE_MLX = False  # Disabled due to compatibility issues

# Default abbreviation expansions (case-insensitive)
DEFAULT_ABBREVIATIONS = {
    # Hotel chains
    "FA": "Fiesta Americana",
    "HIE": "Holiday Inn Express",
    "HI": "Holiday Inn",
    "HGI": "Hilton Garden Inn",
    "HS": "Hampton by Hilton",  # Hampton Suites
    "CI": "Comfort Inn",
    "RI": "Residence Inn",
    "CS": "Courtyard by Marriott",  # Courtyard Suites
    "FI": "Fairfield Inn",
    
    # Mexican cities
    "CDMX": "Ciudad de Mexico Mexico City",
    "GDL": "Guadalajara",
    "MTY": "Monterrey",
    "TIJ": "Tijuana",
    "PVR": "Puerto Vallarta",
    "SJD": "San Jose del Cabo Los Cabos",
    
    # Airport/city codes (common in hotel names)
    "CUN": "Cancun",
    "MEX": "Mexico City",
    "QRO": "Queretaro",
    "MID": "Merida",
    "OAX": "Oaxaca",
    "VER": "Veracruz",
    "AGU": "Aguascalientes",
    "BJX": "Leon Guanajuato",
    "CUU": "Chihuahua",
    "HMO": "Hermosillo",
    "MZT": "Mazatlan",
    "PBC": "Puebla",
    "SLP": "San Luis Potosi",
    "TAM": "Tampico",
    "ZCL": "Zacatecas",
    
    # Common suffixes/prefixes
    "CTR": "Centro Center",
    "APT": "Airport Aeropuerto",
    "DT": "Downtown Centro",
    "BC": "Beach",
    "RST": "Resort",
}


def expand_abbreviations(text: str, abbrev_map: dict[str, str]) -> str:
    """
    Expand abbreviations in text for better embedding matching.
    
    Strategy: Append expansions rather than replace, so both forms contribute
    to the embedding (e.g., "FA Cancun" -> "FA Fiesta Americana Cancun")
    """
    result_parts = [text]  # Start with original
    text_upper = text.upper()
    
    for abbrev, expansion in abbrev_map.items():
        # Check if abbreviation appears as a word boundary
        # This avoids matching "FA" inside "SAFARI"
        import re
        pattern = r'\b' + re.escape(abbrev.upper()) + r'\b'
        if re.search(pattern, text_upper):
            result_parts.append(expansion)
    
    return " ".join(result_parts)


class EntityResolver:
    """Resolve duplicate entities using semantic embeddings"""
    
    def __init__(
        self, 
        model_name: str = "sentence-transformers/all-MiniLM-L6-v2",
        abbreviations: dict[str, str] | None = None,
        expand_abbrevs: bool = True
    ):
        """
        Initialize with embedding model.
        
        Args:
            model_name: Sentence transformer model to use
            abbreviations: Custom abbreviation map (merged with defaults)
            expand_abbrevs: Whether to expand abbreviations before embedding
        """
        if USE_MLX:
            # MLX models for Apple Silicon
            self.model = EmbeddingModel.from_registry("bge-small")
        else:
            self.model = SentenceTransformer(model_name)
        
        self.embeddings_cache = {}
        self.expand_abbrevs = expand_abbrevs
        
        # Merge custom abbreviations with defaults
        self.abbreviations = DEFAULT_ABBREVIATIONS.copy()
        if abbreviations:
            self.abbreviations.update(abbreviations)
    
    def preprocess(self, text: str) -> str:
        """Preprocess text for embedding (abbreviation expansion, normalization)"""
        if self.expand_abbrevs:
            return expand_abbreviations(text, self.abbreviations)
        return text
    
    def embed(self, texts: list[str]) -> np.ndarray:
        """Generate embeddings for a list of texts"""
        if USE_MLX:
            return np.array(self.model.encode(texts))
        else:
            return self.model.encode(texts, convert_to_numpy=True)
    
    def cosine_similarity(self, a: np.ndarray, b: np.ndarray) -> float:
        """Compute cosine similarity between two vectors"""
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
    
    def similarity_matrix(self, embeddings: np.ndarray) -> np.ndarray:
        """Compute pairwise similarity matrix"""
        # Normalize embeddings
        norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
        normalized = embeddings / norms
        # Compute similarity matrix
        return np.dot(normalized, normalized.T)
    
    def find_groups(
        self, 
        names: list[str], 
        threshold: float = 0.85,
        fuzzy: bool = False,
        fuzzy_threshold: float = 0.70
    ) -> list[list[str]]:
        """
        Group similar names together using clustering.
        
        Args:
            names: List of entity names to deduplicate
            threshold: Similarity threshold (0.0 to 1.0). Higher = stricter matching
                      0.85 is good for hotel names with variations
                      0.90+ for stricter matching
            fuzzy: Enable two-pass clustering for orphan recovery
            fuzzy_threshold: Lower threshold for second pass (only for orphans)
        
        Returns:
            List of groups, where each group contains similar names
        """
        if not names:
            return []
        
        # Remove duplicates while preserving order
        unique_names = list(dict.fromkeys(names))
        
        # Preprocess names (expand abbreviations)
        processed_names = [self.preprocess(name) for name in unique_names]
        
        if self.expand_abbrevs:
            print(f"Expanded abbreviations for {len(unique_names)} names")
            # Show a few examples
            for i, (orig, proc) in enumerate(zip(unique_names[:3], processed_names[:3])):
                if orig != proc:
                    print(f"  '{orig}' → '{proc}'")
        
        # Generate embeddings from processed names
        print(f"Generating embeddings for {len(unique_names)} unique names...")
        embeddings = self.embed(processed_names)
        
        # Compute similarity matrix
        print("Computing similarity matrix...")
        sim_matrix = self.similarity_matrix(embeddings)
        
        # Greedy clustering
        print(f"Clustering with threshold {threshold}...")
        used = set()
        groups = []
        
        for i, name in enumerate(unique_names):
            if i in used:
                continue
            
            # Start new group
            group = [name]
            used.add(i)
            
            # Find all similar names
            for j in range(i + 1, len(unique_names)):
                if j not in used and sim_matrix[i, j] >= threshold:
                    group.append(unique_names[j])
                    used.add(j)
            
            groups.append(group)
        
        # Sort groups by size (largest first)
        groups.sort(key=len, reverse=True)
        
        # Fuzzy mode: second pass to rescue orphans
        if fuzzy:
            orphans = [g[0] for g in groups if len(g) == 1]
            non_orphan_groups = [g for g in groups if len(g) > 1]
            
            if orphans and non_orphan_groups:
                print(f"\n🔍 Fuzzy pass: attempting to match {len(orphans)} orphan(s)...")
                
                # Get indices of orphans and group representatives in unique_names
                orphan_indices = [unique_names.index(o) for o in orphans]
                
                # For each non-orphan group, use first item as representative
                group_reps = [(i, g[0], unique_names.index(g[0])) for i, g in enumerate(non_orphan_groups)]
                
                rescued = []  # (orphan, group_index, similarity)
                
                for orphan in orphans:
                    orphan_idx = unique_names.index(orphan)
                    
                    # Find best matching group
                    best_group_idx = None
                    best_sim = fuzzy_threshold
                    second_best_sim = 0
                    
                    for group_idx, rep_name, rep_idx in group_reps:
                        sim = sim_matrix[orphan_idx, rep_idx]
                        if sim > best_sim:
                            second_best_sim = best_sim
                            best_sim = sim
                            best_group_idx = group_idx
                        elif sim > second_best_sim:
                            second_best_sim = sim
                    
                    # Only rescue if match is unambiguous (best >> second best)
                    if best_group_idx is not None:
                        margin = best_sim - second_best_sim
                        if margin >= 0.05:  # At least 5% margin
                            rescued.append((orphan, best_group_idx, best_sim))
                            print(f"  ✓ '{orphan}' → Group with '{non_orphan_groups[best_group_idx][0]}' (sim={best_sim:.3f})")
                        else:
                            print(f"  ⚠ '{orphan}' ambiguous (margin={margin:.3f}), keeping separate")
                
                # Apply rescues
                for orphan, group_idx, _ in rescued:
                    non_orphan_groups[group_idx].append(orphan)
                
                # Rebuild groups list
                rescued_orphans = {r[0] for r in rescued}
                remaining_orphans = [[o] for o in orphans if o not in rescued_orphans]
                groups = non_orphan_groups + remaining_orphans
                
                # Re-sort
                groups.sort(key=len, reverse=True)
                
                print(f"  Rescued {len(rescued)}/{len(orphans)} orphans\n")
        
        return groups
    
    def find_matches(self, query: str, candidates: list[str], top_k: int = 5) -> list[tuple[str, float]]:
        """
        Find best matches for a query string.
        
        Args:
            query: The string to match
            candidates: List of candidate strings
            top_k: Number of top matches to return
        
        Returns:
            List of (candidate, similarity_score) tuples
        """
        # Preprocess all texts
        processed_query = self.preprocess(query)
        processed_candidates = [self.preprocess(c) for c in candidates]
        
        all_texts = [processed_query] + processed_candidates
        embeddings = self.embed(all_texts)
        
        query_emb = embeddings[0]
        candidate_embs = embeddings[1:]
        
        similarities = [
            (candidates[i], self.cosine_similarity(query_emb, candidate_embs[i]))
            for i in range(len(candidates))
        ]
        
        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:top_k]


def load_csv_column(filepath: str, column: str) -> list[str]:
    """Load a specific column from a CSV file"""
    import csv
    
    names = []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if column in row and row[column]:
                names.append(row[column].strip())
    
    return names


def main():
    parser = argparse.ArgumentParser(
        description="Entity Resolver - Semantic deduplication using embeddings",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Find duplicate hotel names in a CSV
  python entity_resolver.py --input hotels.csv --column "name" --threshold 0.85
  
  # Output groups to JSON for review
  python entity_resolver.py --input hotels.csv --column "name" --output groups.json
  
  # Interactive mode - find matches for a query
  python entity_resolver.py --query "Fiesta Americana Cancun" --input hotels.csv --column "name"
  
  # Test with sample data
  python entity_resolver.py --demo
        """
    )
    
    parser.add_argument("--input", "-i", help="Input CSV file")
    parser.add_argument("--column", "-c", help="Column name containing entity names")
    parser.add_argument("--threshold", "-t", type=float, default=0.85,
                       help="Similarity threshold (0.0-1.0, default: 0.85)")
    parser.add_argument("--output", "-o", help="Output JSON file for groups")
    parser.add_argument("--query", "-q", help="Find matches for a specific query")
    parser.add_argument("--top-k", type=int, default=5, help="Number of matches to show")
    parser.add_argument("--demo", action="store_true", help="Run with demo hotel data")
    parser.add_argument("--abbrevs", "-a", help="JSON file with custom abbreviations")
    parser.add_argument("--no-expand", action="store_true", 
                       help="Disable abbreviation expansion")
    parser.add_argument("--fuzzy", "-f", action="store_true",
                       help="Enable fuzzy mode: two-pass clustering to rescue orphans")
    parser.add_argument("--fuzzy-threshold", type=float, default=0.70,
                       help="Lower threshold for fuzzy pass (default: 0.70)")
    parser.add_argument("--show-abbrevs", action="store_true",
                       help="Show built-in abbreviations and exit")
    
    args = parser.parse_args()
    
    # Show built-in abbreviations
    if args.show_abbrevs:
        print("Built-in abbreviations:")
        print("-" * 40)
        for abbrev, expansion in sorted(DEFAULT_ABBREVIATIONS.items()):
            print(f"  {abbrev:8} → {expansion}")
        print("-" * 40)
        print(f"Total: {len(DEFAULT_ABBREVIATIONS)} abbreviations")
        print("\nTo add custom abbreviations, create a JSON file:")
        print('  {"ABC": "My Expansion", "XYZ": "Another One"}')
        print("And pass it with --abbrevs custom.json")
        return
    
    # Load custom abbreviations if provided
    custom_abbrevs = {}
    if args.abbrevs:
        with open(args.abbrevs, 'r', encoding='utf-8') as f:
            custom_abbrevs = json.load(f)
        print(f"Loaded {len(custom_abbrevs)} custom abbreviations from {args.abbrevs}")
    
    # Demo mode
    if args.demo:
        print("\n=== DEMO MODE ===\n")
        demo_names = [
            "Fiesta Americana Cancun",
            "FA Cancun",
            "Fiesta Americana CUN",
            "Fiesta Americana Mexico City",
            "FA CDMX",
            "Fiesta Americana Ciudad de Mexico",
            "Hilton Cancun",
            "Hilton CUN Resort",
            "Hilton Cancun Beach Resort",
            "Marriott Mexico City",
            "Marriott CDMX Centro",
            "JW Marriott Mexico City",
            "Holiday Inn Express Cancun",
            "HIE Cancun Centro",
        ]
        
        print("Sample hotel names:")
        for name in demo_names:
            print(f"  - {name}")
        print()
        
        resolver = EntityResolver(
            abbreviations=custom_abbrevs,
            expand_abbrevs=not args.no_expand
        )
        groups = resolver.find_groups(
            demo_names, 
            threshold=args.threshold,
            fuzzy=args.fuzzy,
            fuzzy_threshold=args.fuzzy_threshold
        )
        
        mode_str = f"threshold={args.threshold}"
        if args.fuzzy:
            mode_str += f", fuzzy={args.fuzzy_threshold}"
        print(f"\n=== GROUPS ({mode_str}) ===\n")
        for i, group in enumerate(groups, 1):
            if len(group) > 1:
                print(f"Group {i} ({len(group)} items) - DUPLICATES FOUND:")
            else:
                print(f"Group {i} ({len(group)} item) - Unique:")
            for name in group:
                print(f"  • {name}")
            print()
        
        return
    
    # Query mode
    if args.query:
        if not args.input or not args.column:
            print("ERROR: --query requires --input and --column")
            sys.exit(1)
        
        names = load_csv_column(args.input, args.column)
        resolver = EntityResolver(
            abbreviations=custom_abbrevs,
            expand_abbrevs=not args.no_expand
        )
        
        print(f"\nFinding matches for: '{args.query}'\n")
        matches = resolver.find_matches(args.query, names, top_k=args.top_k)
        
        print("Top matches:")
        for name, score in matches:
            print(f"  {score:.3f}  {name}")
        
        return
    
    # Standard mode - group all entities
    if not args.input or not args.column:
        parser.print_help()
        sys.exit(1)
    
    names = load_csv_column(args.input, args.column)
    print(f"Loaded {len(names)} records from '{args.column}' column")
    
    resolver = EntityResolver(
        abbreviations=custom_abbrevs,
        expand_abbrevs=not args.no_expand
    )
    groups = resolver.find_groups(
        names, 
        threshold=args.threshold,
        fuzzy=args.fuzzy,
        fuzzy_threshold=args.fuzzy_threshold
    )
    
    # Output results
    duplicates = [g for g in groups if len(g) > 1]
    unique = [g for g in groups if len(g) == 1]
    
    print(f"\n=== RESULTS ===")
    print(f"Total unique entities: {len(groups)}")
    print(f"Groups with duplicates: {len(duplicates)}")
    print(f"Unique (no duplicates): {len(unique)}")
    
    if args.output:
        output_data = {
            "threshold": args.threshold,
            "fuzzy": args.fuzzy,
            "fuzzy_threshold": args.fuzzy_threshold if args.fuzzy else None,
            "total_records": len(names),
            "unique_entities": len(groups),
            "duplicate_groups": len(duplicates),
            "groups": [{"canonical": g[0], "variants": g[1:]} for g in groups if len(g) > 1]
        }
        
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        print(f"\nGroups saved to: {args.output}")
    else:
        print(f"\n=== DUPLICATE GROUPS ===\n")
        for i, group in enumerate(duplicates[:20], 1):  # Show first 20
            print(f"Group {i}: {group[0]}")
            for variant in group[1:]:
                print(f"  └─ {variant}")
            print()
        
        if len(duplicates) > 20:
            print(f"... and {len(duplicates) - 20} more groups")
            print("Use --output to save all groups to JSON")


if __name__ == "__main__":
    main()
