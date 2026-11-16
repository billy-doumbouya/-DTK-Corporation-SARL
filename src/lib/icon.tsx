import type { ComponentType, SVGProps } from 'react'
import {
  FaBuilding,
  FaSeedling,
  FaGraduationCap,
  FaPaw,
  FaSnowflake,
  FaHandshake,
  FaShieldAlt,
  FaChartLine,
  FaLeaf,
  FaHardHat,
  FaTractor,
  FaTools,
  FaWhatsapp,
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaRocket,
  FaUsers,
  FaAward,
  FaCheckCircle,
  FaArrowRight,
  FaArrowLeft,
  FaTimes,
  FaBars,
  FaHome,
  FaCog,
  FaFileAlt,
  FaChartBar,
  FaImage,
  FaImages,
  FaQuestionCircle,
  FaRobot,
  FaUser,
  FaLock,
  FaSignOutAlt,
  FaEye,
  FaEyeSlash,
  FaPaperPlane,
  FaSearch,
  FaFilter,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaUpload,
  FaDownload,
  FaExternalLinkAlt,
  FaClock,
  FaCalendarAlt,
  FaTag,
  FaFolder,
  FaFilePdf,
  FaCircleNotch,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheck,
  FaChevronRight,
  FaChevronLeft,
  FaChevronDown,
  FaChevronUp,
  FaAngleRight,
  FaAngleDown,
  FaList,
  FaTh,
  FaThLarge,
  FaPrint,
  FaShareAlt,
  FaSun,
  FaMoon,
  FaNewspaper,
  FaGlobe,
  FaWrench,
} from 'react-icons/fa'

/**
 * Centralized react-icons mapping. Lookup by key string (stored in DB).
 * The PRD requires react-icons only — no raw emojis or other icon libraries.
 * This module is safe for both server and client components.
 */
const ICON_MAP: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  FaBuilding, FaSeedling, FaGraduationCap, FaPaw, FaSnowflake, FaHandshake,
  FaShieldAlt, FaChartLine, FaLeaf, FaHardHat, FaTractor, FaTools,
  FaWhatsapp, FaFacebookF, FaLinkedinIn, FaInstagram,
  FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaRocket, FaUsers, FaAward, FaCheckCircle,
  FaArrowRight, FaArrowLeft, FaTimes, FaBars, FaHome, FaCog, FaFileAlt,
  FaChartBar, FaImage, FaImages, FaQuestionCircle, FaRobot,
  FaUser, FaLock, FaSignOutAlt, FaEye, FaEyeSlash, FaPaperPlane,
  FaSearch, FaFilter, FaPlus, FaEdit, FaTrash, FaSave, FaUpload, FaDownload,
  FaExternalLinkAlt, FaClock, FaCalendarAlt, FaTag, FaFolder, FaFilePdf,
  FaCircleNotch, FaExclamationTriangle, FaInfoCircle, FaCheck,
  FaChevronRight, FaChevronLeft, FaChevronDown, FaChevronUp,
  FaAngleRight, FaAngleDown, FaList, FaTh, FaThLarge, FaPrint, FaShareAlt,
  FaSun, FaMoon, FaNewspaper, FaGlobe, FaWrench,
}

export type IconKey = keyof typeof ICON_MAP

export interface IconProps extends SVGProps<SVGSVGElement> {
  name: string
  size?: number
}

export function Icon({ name, size = 20, ...rest }: IconProps) {
  const Cmp = ICON_MAP[name] || FaInfoCircle
  return <Cmp width={size} height={size} {...rest} />
}

export function hasIcon(name: string): boolean {
  return name in ICON_MAP
}
