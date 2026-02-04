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


class EntityResolver:
    """Resolve duplicate entities using semantic embeddings"""
    
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        """
        Initialize with embedding model.
        
        For MLX (Apple Silicon): Uses embeddinggemma or similar
        For CPU/GPU: Uses sentence-transformers
        """
        if USE_MLX:
            # MLX models for Apple Silicon
            self.model = EmbeddingModel.from_registry("bge-small")
        else:
            self.model = SentenceTransformer(model_name)
        
        self.embeddings_cache = {}
    
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
    
    def find_groups(self, names: list[str], threshold: float = 0.85) -> list[list[str]]:
        """
        Group similar names together using clustering.
        
        Args:
            names: List of entity names to deduplicate
            threshold: Similarity threshold (0.0 to 1.0). Higher = stricter matching
                      0.85 is good for hotel names with variations
                      0.90+ for stricter matching
        
        Returns:
            List of groups, where each group contains similar names
        """
        if not names:
            return []
        
        # Remove duplicates while preserving order
        unique_names = list(dict.fromkeys(names))
        
        # Generate embeddings
        print(f"Generating embeddings for {len(unique_names)} unique names...")
        embeddings = self.embed(unique_names)
        
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
        all_texts = [query] + candidates
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
    
    args = parser.parse_args()
    
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
        
        resolver = EntityResolver()
        groups = resolver.find_groups(demo_names, threshold=args.threshold)
        
        print(f"\n=== GROUPS (threshold={args.threshold}) ===\n")
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
        resolver = EntityResolver()
        
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
    
    resolver = EntityResolver()
    groups = resolver.find_groups(names, threshold=args.threshold)
    
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
