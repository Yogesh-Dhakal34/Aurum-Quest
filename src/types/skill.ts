export type SkillName =
  | 'study'
  | 'writing'
  | 'communication'
  | 'fitness'
  | 'reading'
  | 'learning'
  | 'problemSolving'
  | 'design'

export type CharacterSkills = Record<SkillName, number>
