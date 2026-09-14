import type { IconType } from "react-icons";

import {
  HiArrowUpRight,
  HiOutlineLink,
  HiArrowTopRightOnSquare,
  HiEnvelope,
  HiCalendarDays,
  HiArrowRight,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineDocument,
  HiOutlineGlobeAsiaAustralia,
  HiOutlineRocketLaunch,
  HiOutlineQueueList,
  HiOutlineLockClosed,
  HiOutlineCircleStack,
  HiOutlineServerStack,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineBriefcase,
} from "react-icons/hi2";

import {
  SiJavascript,
  SiTypescript,
  SiNextdotjs,
  SiReact,
  SiNodedotjs,
  SiNestjs,
  SiPostgresql,
  SiRedis,
  SiSupabase,
  SiDrizzle,
  SiTurborepo,
  SiZod,
} from "react-icons/si";

import { FaGithub, FaLinkedin } from "react-icons/fa6";

export const iconLibrary: Record<string, IconType> = {
  // navigation + chrome
  arrowUpRight: HiArrowUpRight,
  arrowRight: HiArrowRight,
  arrowUpRightFromSquare: HiArrowTopRightOnSquare,
  openLink: HiOutlineLink,
  email: HiEnvelope,
  globe: HiOutlineGlobeAsiaAustralia,
  calendar: HiCalendarDays,
  home: HiOutlineHome,
  person: HiOutlineUser,
  briefcase: HiOutlineBriefcase,
  document: HiOutlineDocument,
  eye: HiOutlineEye,
  eyeOff: HiOutlineEyeSlash,

  // achievement + section icons
  rocket: HiOutlineRocketLaunch,
  queue: HiOutlineQueueList,
  lock: HiOutlineLockClosed,
  database: HiOutlineCircleStack,
  server: HiOutlineServerStack,
  sparkles: HiOutlineSparkles,
  check: HiOutlineCheckCircle,

  // social
  github: FaGithub,
  linkedin: FaLinkedin,

  // technologies — every one of these is named somewhere in content.tsx
  javascript: SiJavascript,
  typescript: SiTypescript,
  nextjs: SiNextdotjs,
  react: SiReact,
  nodejs: SiNodedotjs,
  nestjs: SiNestjs,
  postgresql: SiPostgresql,
  redis: SiRedis,
  supabase: SiSupabase,
  drizzle: SiDrizzle,
  turborepo: SiTurborepo,
  zod: SiZod,
};

export type IconLibrary = typeof iconLibrary;
export type IconName = keyof IconLibrary;
