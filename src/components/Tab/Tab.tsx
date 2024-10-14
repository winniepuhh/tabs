import styles from '../TabsContainer/TabsContainer.module.css';
import icon from '../../assets/Vector.svg';

interface TabProps {
  label: string;
  isPinned: boolean;
  isActive: boolean;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const Tab: React.FC<TabProps> = ({ label, isPinned, isActive, onClick, onDragStart}) => {
  return (
    <div
      className={`${styles.tab} ${isActive ? styles.active : ''} ${isPinned ? styles.pinned : ''}`}
      draggable={!isPinned}
      onClick={onClick}
      onDragStart={onDragStart}
    >
      <img src={icon} alt={`${label} icon`} className={styles['tab-icon']} />
      {label}
    </div>
  );
};

export default Tab;
