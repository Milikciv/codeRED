export const ease = [0.23, 1, 0.32, 1]

export const listItem = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease } },
}

export const listItemX = {
  hidden: { opacity: 0, x: 8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.22, ease } },
}

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}

export const staggerFast = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03 } },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.12 } },
}

export const fadePanel = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease } },
  exit: { opacity: 0, y: 4, transition: { duration: 0.12 } },
}
