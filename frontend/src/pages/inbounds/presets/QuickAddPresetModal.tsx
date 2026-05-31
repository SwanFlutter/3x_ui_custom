/**
 * QuickAddPresetModal — lets users pick a pre-configured protocol preset
 * and immediately creates the inbound with sensible defaults.
 *
 * SwanFlutter
 */

import {
    ThunderboltOutlined,
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    Modal,
    Row,
    Space,
    Tag,
    Tooltip,
    Typography,
    message,
} from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
    CATEGORY_META,
    PROTOCOL_PRESETS,
    groupPresetsByCategory,
    type PresetCategory,
    type ProtocolPreset,
} from '@/lib/xray/protocol-presets';
import { HttpUtil, RandomUtil, Wireguard } from '@/utils';

const { Text, Title } = Typography;

interface QuickAddPresetModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CATEGORY_ORDER: PresetCategory[] = ['reality', 'cdn', 'tls', 'quic', 'obfs', 'plain'];

function AntiDpiIcon({ level }: { level: 'high' | 'medium' | 'low' }) {
  const colors = { high: '#52c41a', medium: '#faad14', low: '#ff4d4f' };
  const labels = { high: '🛡️', medium: '🔶', low: '🔓' };
  return (
    <Tooltip title={`Anti-DPI: ${level}`}>
      <span style={{ color: colors[level], fontSize: 14 }}>{labels[level]}</span>
    </Tooltip>
  );
}

function CdnBadge({ supports }: { supports: boolean }) {
  if (!supports) return null;
  return (
    <Tooltip title="CDN Compatible">
      <Tag color="blue" style={{ fontSize: 11, padding: '0 4px', lineHeight: '18px' }}>CDN</Tag>
    </Tooltip>
  );
}

function PresetCard({
  preset,
  selected,
  onClick,
}: {
  preset: ProtocolPreset;
  selected: boolean;
  onClick: () => void;
}) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'fa-IR' || i18n.language === 'fa';
  const name = isRtl ? preset.nameFa : preset.name;
  const desc = isRtl ? preset.descriptionFa : preset.description;
  const catMeta = CATEGORY_META[preset.category];

  return (
    <Card
      hoverable
      size="small"
      onClick={onClick}
      style={{
        cursor: 'pointer',
        border: selected ? '2px solid #1677ff' : '1px solid #d9d9d9',
        borderRadius: 8,
        transition: 'all 0.2s',
        background: selected ? 'rgba(22, 119, 255, 0.04)' : undefined,
      }}
      styles={{ body: { padding: '10px 12px' } }}
    >
      <Space direction="vertical" size={4} style={{ width: '100%' }}>
        <Space size={6} wrap>
          <Text strong style={{ fontSize: 13 }}>{name}</Text>
          <AntiDpiIcon level={preset.antiDpi} />
          <CdnBadge supports={preset.supportsCdn} />
        </Space>
        <Text type="secondary" style={{ fontSize: 11, lineHeight: 1.4 }}>{desc}</Text>
        <Space size={4} wrap>
          <Tag color={catMeta.color} style={{ fontSize: 10, padding: '0 4px', lineHeight: '18px', marginInlineEnd: 0 }}>
            {isRtl ? catMeta.labelFa : catMeta.label}
          </Tag>
          <Text type="secondary" style={{ fontSize: 11 }}>
            Port: {preset.defaultPort}
          </Text>
        </Space>
      </Space>
    </Card>
  );
}

export default function QuickAddPresetModal({
  open,
  onClose,
  onCreated,
}: QuickAddPresetModalProps) {
  const { t, i18n } = useTranslation();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const isRtl = i18n.language === 'fa-IR' || i18n.language === 'fa';
  const grouped = groupPresetsByCategory(PROTOCOL_PRESETS);

  const selectedPreset = PROTOCOL_PRESETS.find((p) => p.key === selectedKey) ?? null;

  const handleCreate = async () => {
    if (!selectedPreset) return;
    setCreating(true);
    try {
      const settings = selectedPreset.buildSettings();
      const streamSettings = selectedPreset.buildStreamSettings();

      // For WireGuard, generate a real keypair
      if (selectedPreset.protocol === 'wireguard') {
        const kp = Wireguard.generateKeypair();
        const peerKp = Wireguard.generateKeypair();
        (settings as Record<string, unknown>).secretKey = kp.privateKey;
        const peers = (settings as { peers: Record<string, unknown>[] }).peers;
        if (peers && peers.length > 0) {
          peers[0].privateKey = peerKp.privateKey;
          peers[0].publicKey = peerKp.publicKey;
        }
      }

      const port = RandomUtil.randomInteger(
        selectedPreset.defaultPort,
        selectedPreset.defaultPort,
      );

      const presetName = isRtl ? selectedPreset.nameFa : selectedPreset.name;

      const payload = {
        up: 0,
        down: 0,
        total: 0,
        remark: presetName,
        enable: true,
        expiryTime: 0,
        trafficReset: 'never',
        lastTrafficResetTime: 0,
        listen: '',
        port,
        protocol: selectedPreset.protocol,
        settings: JSON.stringify(settings),
        streamSettings: Object.keys(streamSettings).length > 0
          ? JSON.stringify(streamSettings)
          : '{}',
        sniffing: JSON.stringify({ enabled: false }),
        tag: '',
      };

      const msg = await HttpUtil.post('/panel/api/inbounds/add', payload);
      if (msg?.success) {
        messageApi.success(t('pages.inbounds.presets.createSuccess', { name: presetName }));
        onCreated();
        onClose();
        setSelectedKey(null);
      } else {
        messageApi.error(msg?.msg || t('somethingWentWrong'));
      }
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setSelectedKey(null);
    onClose();
  };

  return (
    <>
      {messageContextHolder}
      <Modal
        open={open}
        title={
          <Space>
            <ThunderboltOutlined style={{ color: '#1677ff' }} />
            <span>{t('pages.inbounds.presets.title')}</span>
          </Space>
        }
        width={760}
        onCancel={handleClose}
        destroyOnHidden
        footer={
          <Space>
            <Button onClick={handleClose}>{t('close')}</Button>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              disabled={!selectedPreset}
              loading={creating}
              onClick={handleCreate}
            >
              {t('pages.inbounds.presets.createBtn')}
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" size={4} style={{ width: '100%', marginBottom: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {t('pages.inbounds.presets.subtitle')}
          </Text>
          <Space size={12} wrap>
            <Space size={4}>
              <span>🛡️</span>
              <Text type="secondary" style={{ fontSize: 11 }}>{t('pages.inbounds.presets.legendHigh')}</Text>
            </Space>
            <Space size={4}>
              <span>🔶</span>
              <Text type="secondary" style={{ fontSize: 11 }}>{t('pages.inbounds.presets.legendMedium')}</Text>
            </Space>
            <Space size={4}>
              <span>🔓</span>
              <Text type="secondary" style={{ fontSize: 11 }}>{t('pages.inbounds.presets.legendLow')}</Text>
            </Space>
            <Tag color="blue" style={{ fontSize: 11 }}>CDN</Tag>
            <Text type="secondary" style={{ fontSize: 11 }}>{t('pages.inbounds.presets.legendCdn')}</Text>
          </Space>
        </Space>

        <div style={{ maxHeight: 480, overflowY: 'auto', paddingRight: 4 }}>
          {CATEGORY_ORDER.map((cat) => {
            const presets = grouped[cat];
            if (!presets || presets.length === 0) return null;
            const catMeta = CATEGORY_META[cat];
            return (
              <div key={cat} style={{ marginBottom: 16 }}>
                <Title level={5} style={{ marginBottom: 8, fontSize: 13 }}>
                  <Tag color={catMeta.color}>{isRtl ? catMeta.labelFa : catMeta.label}</Tag>
                </Title>
                <Row gutter={[8, 8]}>
                  {presets.map((preset) => (
                    <Col key={preset.key} xs={24} sm={12}>
                      <PresetCard
                        preset={preset}
                        selected={selectedKey === preset.key}
                        onClick={() => setSelectedKey(preset.key)}
                      />
                    </Col>
                  ))}
                </Row>
              </div>
            );
          })}
        </div>

        {selectedPreset && (
          <Card
            size="small"
            style={{ marginTop: 12, background: 'rgba(22, 119, 255, 0.04)', border: '1px solid #1677ff40' }}
            styles={{ body: { padding: '8px 12px' } }}
          >
            <Space size={8} wrap>
              <Text strong style={{ fontSize: 12 }}>
                {t('pages.inbounds.presets.selected')}:
              </Text>
              <Text style={{ fontSize: 12 }}>
                {isRtl ? selectedPreset.nameFa : selectedPreset.name}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                — Port {selectedPreset.defaultPort} — {selectedPreset.protocol.toUpperCase()}
              </Text>
              <AntiDpiIcon level={selectedPreset.antiDpi} />
              <CdnBadge supports={selectedPreset.supportsCdn} />
            </Space>
          </Card>
        )}
      </Modal>
    </>
  );
}
