import { BlockType, BLOCK_TYPES, BlockTypeInfo } from '../types/database';

/**
 * Get block type information including color and label
 * @param type - Block type
 * @returns Block type info object
 */
export function getBlockTypeInfo(type: BlockType): BlockTypeInfo {
  return BLOCK_TYPES[type];
}

/**
 * Get Tailwind classes for block type styling
 * @param type - Block type
 * @returns Object with Tailwind class strings
 */
export function getBlockClasses(type: BlockType) {
  const info = getBlockTypeInfo(type);

  // Map colors to Tailwind classes or use inline styles
  return {
    borderColor: info.color,
    textColor: info.color,
    backgroundColor: `${info.color}10`, // 10% opacity
  };
}

/**
 * Get inline style object for block type
 * @param type - Block type
 * @returns React style object
 */
export function getBlockStyle(type: BlockType): React.CSSProperties {
  const info = getBlockTypeInfo(type);

  return {
    borderColor: info.color,
    color: info.color,
  };
}

/**
 * Get background color with opacity
 * @param type - Block type
 * @param opacity - Opacity value (0-1)
 * @returns Hex color with opacity
 */
export function getBlockBackgroundColor(type: BlockType, opacity: number = 0.1): string {
  const info = getBlockTypeInfo(type);
  const hex = info.color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
