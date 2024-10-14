import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tab } from '../Tab/Tab';
import styles from './TabsContainer.module.css';

interface TabType {
    label: string;
    isPinned: boolean;
    url: string;
    visibility: boolean;
}

const initialTabs: TabType[] = [
    { label: 'DashBoard', isPinned: false, url: '/dashboard', visibility: true },
    { label: 'Banking', isPinned: false, url: '/banking', visibility: true },
    { label: 'Telefonie', isPinned: false, url: '/telefonie', visibility: true },
    { label: 'Accounting', isPinned: false, url: '/accounting', visibility: true },
    { label: 'Verkauf', isPinned: false, url: '/verkauf', visibility: true },
    { label: 'Statistik', isPinned: false, url: '/statistik', visibility: true },
    { label: 'Post Office', isPinned: false, url: '/postoffice', visibility: true },
    { label: 'Administration', isPinned: false, url: '/administration', visibility: true },
    { label: 'Help', isPinned: false, url: '/help', visibility: true },
    { label: 'Warenbestand', isPinned: false, url: '/warenbestand', visibility: true },
    { label: 'Auswahllisten', isPinned: false, url: '/auswahllisten', visibility: true },
    { label: 'Einkauf', isPinned: false, url: '/einkauf', visibility: true },
    { label: 'Rechn', isPinned: false, url: '/rechn', visibility: true },
    { label: 'Lagerverwaltung', isPinned: false, url: '/lagerverwaltung', visibility: false },
];

export const TabsContainer = () => {
    const [tabs, setTabs] = useState<TabType[]>([]);
    const [activeTab, setActiveTab] = useState('');
    const [hoveredTab, setHoveredTab] = useState<string | null>(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const savedTabs = localStorage.getItem('tabs');
        if (savedTabs) {
            setTabs(JSON.parse(savedTabs));
        } else {
            setTabs(initialTabs);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('tabs', JSON.stringify(tabs));
    }, [tabs]);

    const handleTabClick = (tab: TabType) => {
        setActiveTab(tab.label);
        navigate(tab.url);
    };

    const handlePinTab = (label: string) => {
        const updatedTabs = tabs.map(tab => {
            if (tab.label === label) {
                return { ...tab, isPinned: !tab.isPinned }; // Змінюємо лише статус запінення
            }
            return tab;
        });

        setTabs(updatedTabs);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        if (tabs[index].isPinned) {
            e.preventDefault();
        } else {
            e.dataTransfer.setData('draggedTabIndex', index.toString());
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        const draggedIndex = parseInt(e.dataTransfer.getData('draggedTabIndex'), 10);
        if (draggedIndex !== index) {
            const newTabs = [...tabs];
            const draggedTab = newTabs[draggedIndex];
            newTabs.splice(draggedIndex, 1);
            newTabs.splice(index, 0, draggedTab);
            setTabs(newTabs);
        }
    };

    const pinnedTabs = tabs.filter(tab => tab.isPinned);
    const unpinnedTabs = tabs.filter(tab => !tab.isPinned && tab.visibility);
    const hiddenTabs = tabs.filter(tab => !tab.isPinned && !tab.visibility);

    const handleScroll = useCallback(() => {
        const container = ref.current;
        if (!container) return;

        const updatedTabs = tabs.map((tab, index) => {
            const tabElement = container.children[index];

            if (!tabElement) {
                return tab;
            }

            const { left, right } = tabElement.getBoundingClientRect();
            const { left: containerLeft, right: containerRight } = container.getBoundingClientRect();

            const isVisible = left >= containerLeft && right <= containerRight;

            return { ...tab, visibility: isVisible };
        });

        const hasChanged = updatedTabs.some((tab, index) => tab.visibility !== tabs[index].visibility);

        if (hasChanged) {
            setTabs(updatedTabs);
        }
    }, [tabs]);

    useEffect(() => {
        if (ref.current) {
            const container = ref.current;
            container.addEventListener('scroll', handleScroll);

            handleScroll();
        }

        return () => {
            if (ref.current) {
                ref.current.removeEventListener('scroll', handleScroll);
            }
        };
    }, [handleScroll, tabs]);

    return (
        <div className={styles['tabs-container']}>
            <div className={styles['pinned-tabs']}>
                {pinnedTabs.map((tab, index) => (
                    <div key={tab.label} className={styles['tab-wrapper']}
                        onMouseEnter={() => setHoveredTab(tab.label)}
                        onMouseLeave={() => setHoveredTab(null)}>
                        <Tab
                            label={tab.label}
                            isPinned={tab.isPinned}
                            isActive={activeTab === tab.label}
                            onClick={() => handleTabClick(tab)}
                            onDragStart={(e) => handleDragStart(e, index)}
                        />
                        {hoveredTab === tab.label && (
                            <div className={styles['pin-tab']}>
                                <button onClick={() => handlePinTab(tab.label)}>
                                    {tab.isPinned ? 'Unpin Tab' : 'Pin Tab'}
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div ref={ref} className={styles['unpinned-tabs']}>
                {unpinnedTabs.map((tab, index) => (
                    <div key={tab.label} className={styles['tab-wrapper']}
                        onDrop={(e) => handleDrop(e, index + pinnedTabs.length)}
                        onDragOver={(e) => e.preventDefault()}
                        onMouseEnter={() => setHoveredTab(tab.label)}
                        onMouseLeave={() => setHoveredTab(null)}>
                        <Tab
                            label={tab.label}
                            isPinned={tab.isPinned}
                            isActive={activeTab === tab.label}
                            onClick={() => handleTabClick(tab)}
                            onDragStart={(e) => handleDragStart(e, index + pinnedTabs.length)}
                        />
                        {hoveredTab === tab.label && (
                            <div className={styles['pin-tab']}>
                                <button onClick={() => handlePinTab(tab.label)}>
                                    {tab.isPinned ? 'Unpin Tab' : 'Pin Tab'}
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {hiddenTabs.length > 0 && (
                <div className={styles['dropdown']}>
                    <button onClick={() => setDropdownVisible(!dropdownVisible)}>
                        {dropdownVisible ? 'Hide Tabs' : 'Show Hidden Tabs'}
                    </button>
                    {dropdownVisible && (
                        <div className={styles['hidden-tabs']}>
                            {hiddenTabs.map(tab => (
                                <div key={tab.label} className={styles['tab-wrapper']}
                                    onMouseEnter={() => setHoveredTab(tab.label)}
                                    onMouseLeave={() => setHoveredTab(null)}
                                    onClick={() => handleTabClick(tab)}>
                                    <Tab
                                        label={tab.label}
                                        isPinned={tab.isPinned}
                                        isActive={activeTab === tab.label}
                                        onClick={() => handleTabClick(tab)}
                                        onDragStart={(e) => handleDragStart(e, pinnedTabs.length)}
                                    />
                                    {hoveredTab === tab.label && (
                                        <div className={styles['pin-tab']}>
                                            <button onClick={(e) => {
                                                e.stopPropagation(); // Уникаємо конфлікту з onClick для табу
                                                handlePinTab(tab.label);
                                            }}>
                                                {tab.isPinned ? 'Unpin Tab' : 'Pin Tab'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TabsContainer;
