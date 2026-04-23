import { Modal, Form, Input, Select } from 'antd';
import type { TestCase } from '@/stores';
import styles from './Vrt.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TestCaseInput = Omit<TestCase, 'id' | 'createdAt' | 'updatedAt'>;

export interface SaveTestCaseModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSave: (testCase: TestCaseInput) => void;
  readonly defaultValues?: {
    componentId: string;
    sceneId: string;
    dsl: string;
  };
}

type FormValues = {
  name: string;
  tags: string[];
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  mockData: string;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PRIORITY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'P0', label: 'P0 - 关键' },
  { value: 'P1', label: 'P1 - 重要' },
  { value: 'P2', label: 'P2 - 一般' },
  { value: 'P3', label: 'P3 - 低' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SaveTestCaseModal({
  open,
  onClose,
  onSave,
  defaultValues,
}: SaveTestCaseModalProps): React.ReactElement {
  const [form] = Form.useForm<FormValues>();

  function handleFinish(values: FormValues): void {
    const testCase: TestCaseInput = {
      name: values.name,
      componentId: defaultValues?.componentId ?? '',
      sceneId: defaultValues?.sceneId ?? '',
      dsl: defaultValues?.dsl ?? values.mockData,
      mockData: values.mockData,
      tags: values.tags,
      priority: values.priority,
      ignoreRegions: [],
      baselineImageId: null,
    };

    onSave(testCase);
    form.resetFields();
  }

  function handleCancel(): void {
    form.resetFields();
    onClose();
  }

  return (
    <Modal
      title="保存测试用例"
      open={open}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      okText="保存"
      cancelText="取消"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        className={styles.saveModalForm}
        initialValues={{
          name: '',
          tags: [],
          priority: 'P1',
          mockData: defaultValues?.dsl ?? '',
        }}
        onFinish={handleFinish}
      >
        <Form.Item
          label="用例名称"
          name="name"
          rules={[{ required: true, message: '请输入用例名称' }]}
        >
          <Input placeholder="请输入用例名称" maxLength={100} />
        </Form.Item>

        <Form.Item label="标签" name="tags">
          <Select
            mode="tags"
            placeholder="输入后按回车添加标签"
            allowClear
          />
        </Form.Item>

        <Form.Item
          label="优先级"
          name="priority"
          rules={[{ required: true, message: '请选择优先级' }]}
        >
          <Select options={PRIORITY_OPTIONS} />
        </Form.Item>

        <Form.Item label="Mock 数据" name="mockData">
          <Input.TextArea rows={6} placeholder="输入 Mock 数据或 DSL" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
