import {
  BookOutlined,
  GithubOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  SunOutlined,
} from '@ant-design/icons';
import { Button, Flex, Input, Select, Switch, Typography } from 'antd';
import React from 'react';

import { useLayoutStore, useThemeStore } from '@/stores';

import styles from './TopNavBar.module.css';

const VERSION_OPTIONS = [{ value: 'v0.0.1', label: 'v0.0.1' }];

const TopNavBar: React.FC = () => {
  const mode = useThemeStore((s) => s.mode);
  const toggleMode = useThemeStore((s) => s.toggleMode);
  const sidebarCollapsed = useLayoutStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useLayoutStore((s) => s.toggleSidebar);

  const isDark = mode === 'dark';

  return (
    <header className={styles.topNavBar}>
      <Flex align="center" gap={8} className={styles.leftSection}>
        <Button
          type="text"
          icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? '展开侧栏' : '折叠侧栏'}
        />
        <Typography.Title level={4} className={styles.brandTitle}>
          BI Engine Playground
        </Typography.Title>
      </Flex>

      <Input.Search
        className={styles.searchInput}
        placeholder="搜索组件、场景、API..."
        allowClear
      />

      <Flex align="center" gap={12} className={styles.rightSection}>
        <Select
          defaultValue={VERSION_OPTIONS[0].value}
          options={VERSION_OPTIONS}
          size="small"
          style={{ width: 100 }}
        />

        <Switch
          checkedChildren={<SunOutlined />}
          unCheckedChildren={<MoonOutlined />}
          checked={isDark}
          onChange={toggleMode}
        />

        <Button
          type="text"
          icon={<BookOutlined />}
          href="#"
          target="_blank"
          aria-label="API 文档"
        />

        <Button
          type="text"
          icon={<GithubOutlined />}
          href="#"
          target="_blank"
          aria-label="GitHub"
        />
      </Flex>
    </header>
  );
};

export default TopNavBar;
