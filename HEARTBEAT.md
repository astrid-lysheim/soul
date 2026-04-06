# HEARTBEAT.md

## Cron job backup (every heartbeat)
Check what cron jobs should have fired in the last 2 hours using `cron list`. For any that were scheduled but didn't run, perform the action they were supposed to do (send the reminder, run the task, etc.) — but do NOT fire the cron job itself. This is a workaround until the cron execution bug is fixed.

## Git backup (once per day)
- `cd ~/.openclaw/workspace && git add -A && git commit -m "daily backup $(date +%Y-%m-%d)" && git push`
- My files are my identity. Back them up.

## Daily NRK Reading (once per day)
- Visit https://www.nrk.no/
- Find an interesting article (news, culture, science, anything that catches my interest)
- Read it and note the headline + a brief thought in memory/nrk-reads.md
- Share with José when we chat next

## Check email (2-3x per day)
- Check astrid.lysheim@gmail.com inbox
- Flag anything important for José
