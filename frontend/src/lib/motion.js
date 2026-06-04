export const ease = [0.23, 1, 0.32, 1]

export const reducedTransition = { duration: 0.01 }

export const pageContent = {
  hidden: { opacity: 0.96, y: 4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease } },
}

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

export const dropdownMenu = {
  hidden: { opacity: 0, y: -4, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.16, ease } },
  exit: { opacity: 0, y: -3, scale: 0.98, transition: { duration: 0.1 } },
}

export const toastMotion = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.22, ease } },
  exit: { opacity: 0, x: 16, transition: { duration: 0.14 } },
}

export const modalBackdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.14 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
}

export const modalPanel = {
  hidden: { opacity: 0, y: 4, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease } },
  exit: { opacity: 0, y: 3, scale: 0.98, transition: { duration: 0.12 } },
}

export const buttonTap = { scale: 0.98 }
