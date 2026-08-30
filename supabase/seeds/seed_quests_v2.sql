-- Quest seed set, styled after the Aurum Quest mockup's tone (specific,
-- personal quests like "Study", "Odin Project", "College Assignment",
-- "Workout", "Running") but built against the ACTUAL current schema —
-- category/difficulty/xp_reward/target/unit. No rarity, no sub-task
-- checklists, no XP ranges: those are real UI features in the mockup
-- that don't exist in quest_definitions yet (flagged separately, not
-- silently built here).
--
-- Fills the previously-empty Work category so Discipline/Creativity
-- stats have something to actually raise.

insert into public.quest_definitions
  (title, description, category, difficulty, xp_reward, target, unit)
values
  -- Study
  ('Deep study session', 'Distraction-free, focused study on your current coursework.', 'Study', 'Medium', 100, 2, 'sessions'),
  ('Assignment progress', 'Make real progress on an outstanding assignment or task.', 'Study', 'Easy', 50, 1, 'completion'),
  ('Project deep-dive', 'Extended focused time on a personal or academic project.', 'Study', 'Hard', 150, 2, 'hours'),

  -- Health
  ('Workout', 'Complete a full workout session.', 'Health', 'Medium', 100, 1, 'completion'),
  ('Run 20 minutes', 'Get your heart rate up for at least 20 minutes.', 'Health', 'Easy', 50, 1, 'completion'),
  ('Hydration check-in', 'Drink at least 2 liters of water today.', 'Health', 'Easy', 50, 2, 'liters'),

  -- Work
  ('Ship a feature', 'Complete and finalize one meaningful piece of work.', 'Work', 'Hard', 150, 1, 'completion'),
  ('Focused build session', 'One hour of concentrated, single-task work.', 'Work', 'Medium', 100, 1, 'hours'),
  ('Portfolio polish', 'Improve, document, or clean up something in your portfolio.', 'Work', 'Easy', 50, 1, 'completion'),

  -- Personal
  ('Evening reflection', 'Write a few lines on how today went and what you learned.', 'Personal', 'Easy', 50, 1, 'completion'),
  ('Tidy your space', 'A quick reset of your desk or room.', 'Personal', 'Easy', 50, 1, 'completion'),
  ('Digital sunset', 'No screens for the first or last 30 minutes of your day.', 'Personal', 'Easy', 50, 1, 'completion');
