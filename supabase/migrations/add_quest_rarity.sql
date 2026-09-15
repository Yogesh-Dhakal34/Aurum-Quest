-- Phase 10: revive the ranged rarity system from GAMEPLAY.md §4
--
-- Specified back in Phase 1 (reward *ranges*: Common 10-25, Rare
-- 30-60, Epic 70-150, Legendary 160-500) but never actually built --
-- the schema shipped with flat Easy/Medium/Hard `difficulty` and a
-- single author-set `xp_reward` integer, with no rarity field at all.
--
-- rarity is deliberately additive, not a replacement for difficulty:
-- difficulty already has its own real job (drives character stat
-- gains via getStatGainsForQuest) and stays exactly as-is. xp_reward
-- also stays exactly as-is -- a flat authored value, no randomness,
-- no cross-column formula. What's genuinely new here is real
-- categorization with the band boundaries the docs specify, not a
-- different reward mechanic.
--
-- Backfilled automatically from each quest's CURRENT xp_reward rather
-- than requiring the live quest list to be reviewed by hand -- every
-- existing quest lands in whichever band its existing XP value
-- already falls into, so nothing needs manual re-entry.

alter table public.quest_definitions add column if not exists rarity text;

update public.quest_definitions
set rarity = case
  when xp_reward <= 25 then 'Common'
  when xp_reward <= 60 then 'Rare'
  when xp_reward <= 150 then 'Epic'
  else 'Legendary'
end
where rarity is null;

alter table public.quest_definitions
  alter column rarity set not null,
  alter column rarity set default 'Common';

alter table public.quest_definitions
  drop constraint if exists quest_definitions_rarity_check;

alter table public.quest_definitions
  add constraint quest_definitions_rarity_check
  check (rarity in ('Common', 'Rare', 'Epic', 'Legendary'));

-- Deliberately NOT adding a hard check that xp_reward must fall within
-- its rarity's band going forward -- GAMEPLAY.md itself treats these
-- ranges as "a tuning parameter, not a fixed commitment," and a rigid
-- cross-column constraint would fight future rebalancing rather than
-- support it. The band mapping above is a one-time backfill, not an
-- enforced invariant.