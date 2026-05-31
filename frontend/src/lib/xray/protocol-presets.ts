/**
 * Protocol presets for quick-add inbound creation.
 *
 * Each preset defines a complete, ready-to-use inbound configuration
 * so users don't have to manually configure every field.
 *
 * Maintained by SwanFlutter — based on common deployment patterns.
 */

import { RandomUtil } from '@/utils';

export type PresetCategory =
  | 'reality'
  | 'cdn'
  | 'tls'
  | 'quic'
  | 'obfs'
  | 'plain';

export interface ProtocolPreset {
  /** Unique key for this preset */
  key: string;
  /** Display name (English) */
  name: string;
  /** Persian display name */
  nameFa: string;
  /** Short description */
  description: string;
  /** Persian description */
  descriptionFa: string;
  /** Category for grouping */
  category: PresetCategory;
  /** Whether this preset supports CDN (Cloudflare etc.) */
  supportsCdn: boolean;
  /** Anti-DPI strength */
  antiDpi: 'high' | 'medium' | 'low';
  /** Default port */
  defaultPort: number;
  /** xray protocol name */
  protocol: string;
  /** Build the settings JSON object */
  buildSettings: () => Record<string, unknown>;
  /** Build the streamSettings JSON object */
  buildStreamSettings: () => Record<string, unknown>;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function baseTlsStream(sni = '', path = '/', host = ''): Record<string, unknown> {
  return {
    network: 'ws',
    security: 'tls',
    tlsSettings: {
      serverName: sni,
      alpn: ['http/1.1'],
      certificates: [
        {
          useFile: true,
          certificateFile: '',
          keyFile: '',
          certificate: [],
          key: [],
          oneTimeLoading: false,
          usage: 'encipherment',
          buildChain: false,
        },
      ],
      settings: { allowInsecure: false, fingerprint: 'chrome' },
    },
    wsSettings: {
      path,
      host,
      headers: {},
    },
  };
}

function baseRealityStream(dest = 'www.google.com:443', serverName = 'www.google.com'): Record<string, unknown> {
  return {
    network: 'tcp',
    security: 'reality',
    realitySettings: {
      show: false,
      dest,
      xver: 0,
      serverNames: [serverName],
      privateKey: '',
      minClientVer: '',
      maxClientVer: '',
      maxTimeDiff: 0,
      shortIds: [RandomUtil.randomLowerAndNum(8)],
      settings: {
        publicKey: '',
        fingerprint: 'chrome',
        serverName,
        spiderX: '/',
      },
    },
    tcpSettings: { header: { type: 'none' } },
  };
}

function baseGrpcStream(serviceName = 'grpc', sni = ''): Record<string, unknown> {
  return {
    network: 'grpc',
    security: 'tls',
    tlsSettings: {
      serverName: sni,
      alpn: ['h2'],
      certificates: [
        {
          useFile: true,
          certificateFile: '',
          keyFile: '',
          certificate: [],
          key: [],
          oneTimeLoading: false,
          usage: 'encipherment',
          buildChain: false,
        },
      ],
      settings: { allowInsecure: false, fingerprint: 'chrome' },
    },
    grpcSettings: {
      serviceName,
      multiMode: false,
      authority: '',
    },
  };
}

function baseXhttpStream(path = '/xhttp', sni = ''): Record<string, unknown> {
  return {
    network: 'xhttp',
    security: 'tls',
    tlsSettings: {
      serverName: sni,
      alpn: ['h2', 'http/1.1'],
      certificates: [
        {
          useFile: true,
          certificateFile: '',
          keyFile: '',
          certificate: [],
          key: [],
          oneTimeLoading: false,
          usage: 'encipherment',
          buildChain: false,
        },
      ],
      settings: { allowInsecure: false, fingerprint: 'chrome' },
    },
    xhttpSettings: {
      path,
      host: sni,
      headers: {},
      mode: '',
    },
  };
}

function baseHttpUpgradeStream(path = '/hu', sni = ''): Record<string, unknown> {
  return {
    network: 'httpupgrade',
    security: 'tls',
    tlsSettings: {
      serverName: sni,
      alpn: ['http/1.1'],
      certificates: [
        {
          useFile: true,
          certificateFile: '',
          keyFile: '',
          certificate: [],
          key: [],
          oneTimeLoading: false,
          usage: 'encipherment',
          buildChain: false,
        },
      ],
      settings: { allowInsecure: false, fingerprint: 'chrome' },
    },
    httpupgradeSettings: {
      path,
      host: sni,
      headers: {},
    },
  };
}

// ─── Preset Definitions ──────────────────────────────────────────────────────

export const PROTOCOL_PRESETS: ProtocolPreset[] = [
  // ── VLESS Reality (Vision) ──────────────────────────────────────────────
  {
    key: 'vless_reality_vision',
    name: 'VLESS + Reality (Vision)',
    nameFa: 'VLESS + Reality (Vision)',
    description: 'VLESS with XTLS Vision flow over Reality — highest anti-censorship, no CDN',
    descriptionFa: 'VLESS با جریان XTLS Vision روی Reality — بالاترین ضد سانسور، بدون CDN',
    category: 'reality',
    supportsCdn: false,
    antiDpi: 'high',
    defaultPort: 443,
    protocol: 'vless',
    buildSettings: () => ({
      clients: [],
      decryption: 'none',
      encryption: 'none',
      fallbacks: [],
    }),
    buildStreamSettings: () => ({
      ...baseRealityStream('www.google.com:443', 'www.google.com'),
    }),
  },

  // ── VLESS Reality (XHTTP) ───────────────────────────────────────────────
  {
    key: 'vless_reality_xhttp',
    name: 'VLESS + Reality + XHTTP',
    nameFa: 'VLESS + Reality + XHTTP',
    description: 'VLESS over XHTTP transport with Reality — CDN-compatible Reality variant',
    descriptionFa: 'VLESS روی XHTTP با Reality — نسخه سازگار با CDN از Reality',
    category: 'reality',
    supportsCdn: false,
    antiDpi: 'high',
    defaultPort: 2053,
    protocol: 'vless',
    buildSettings: () => ({
      clients: [],
      decryption: 'none',
      encryption: 'none',
      fallbacks: [],
    }),
    buildStreamSettings: () => ({
      network: 'xhttp',
      security: 'reality',
      realitySettings: {
        show: false,
        dest: 'www.digikala.com:443',
        xver: 0,
        serverNames: ['www.digikala.com'],
        privateKey: '',
        minClientVer: '',
        maxClientVer: '',
        maxTimeDiff: 0,
        shortIds: [RandomUtil.randomLowerAndNum(8)],
        settings: {
          publicKey: '',
          fingerprint: 'chrome',
          serverName: 'www.digikala.com',
          spiderX: '/',
        },
      },
      xhttpSettings: {
        path: '/xhttp-stream',
        host: '',
        headers: {},
        mode: '',
      },
    }),
  },

  // ── VMess + WebSocket + TLS ─────────────────────────────────────────────
  {
    key: 'vmess_ws_tls',
    name: 'VMess + WebSocket + TLS',
    nameFa: 'VMess + WebSocket + TLS',
    description: 'VMess over WebSocket with TLS — CDN compatible (Cloudflare)',
    descriptionFa: 'VMess روی WebSocket با TLS — سازگار با CDN (کلودفلر)',
    category: 'cdn',
    supportsCdn: true,
    antiDpi: 'medium',
    defaultPort: 443,
    protocol: 'vmess',
    buildSettings: () => ({ clients: [] }),
    buildStreamSettings: () => baseTlsStream('', '/vmess-ws', ''),
  },

  // ── VMess + gRPC + TLS ──────────────────────────────────────────────────
  {
    key: 'vmess_grpc_tls',
    name: 'VMess + gRPC + TLS',
    nameFa: 'VMess + gRPC + TLS',
    description: 'VMess over gRPC with TLS — CDN compatible, HTTP/2',
    descriptionFa: 'VMess روی gRPC با TLS — سازگار با CDN، HTTP/2',
    category: 'cdn',
    supportsCdn: true,
    antiDpi: 'medium',
    defaultPort: 443,
    protocol: 'vmess',
    buildSettings: () => ({ clients: [] }),
    buildStreamSettings: () => baseGrpcStream('vmess-grpc', ''),
  },

  // ── VMess + HTTPUpgrade + TLS ───────────────────────────────────────────
  {
    key: 'vmess_httpupgrade_tls',
    name: 'VMess + HTTPUpgrade + TLS',
    nameFa: 'VMess + HTTPUpgrade + TLS',
    description: 'VMess over HTTPUpgrade with TLS — CDN compatible',
    descriptionFa: 'VMess روی HTTPUpgrade با TLS — سازگار با CDN',
    category: 'cdn',
    supportsCdn: true,
    antiDpi: 'medium',
    defaultPort: 2055,
    protocol: 'vmess',
    buildSettings: () => ({ clients: [] }),
    buildStreamSettings: () => baseHttpUpgradeStream('/vmess-hu', ''),
  },

  // ── VMess + XHTTP + TLS ─────────────────────────────────────────────────
  {
    key: 'vmess_xhttp_tls',
    name: 'VMess + XHTTP + TLS',
    nameFa: 'VMess + XHTTP + TLS',
    description: 'VMess over XHTTP with TLS — CDN compatible, modern transport',
    descriptionFa: 'VMess روی XHTTP با TLS — سازگار با CDN، انتقال مدرن',
    category: 'cdn',
    supportsCdn: true,
    antiDpi: 'medium',
    defaultPort: 2053,
    protocol: 'vmess',
    buildSettings: () => ({ clients: [] }),
    buildStreamSettings: () => baseXhttpStream('/vmess-xhttp', ''),
  },

  // ── VLESS + WebSocket + TLS (CDN) ───────────────────────────────────────
  {
    key: 'vless_ws_tls',
    name: 'VLESS + WebSocket + TLS',
    nameFa: 'VLESS + WebSocket + TLS',
    description: 'VLESS over WebSocket with TLS — CDN compatible',
    descriptionFa: 'VLESS روی WebSocket با TLS — سازگار با CDN',
    category: 'cdn',
    supportsCdn: true,
    antiDpi: 'medium',
    defaultPort: 2057,
    protocol: 'vless',
    buildSettings: () => ({
      clients: [],
      decryption: 'none',
      encryption: 'none',
      fallbacks: [],
    }),
    buildStreamSettings: () => baseTlsStream('', '/vless-ws', ''),
  },

  // ── VLESS + XHTTP + TLS ─────────────────────────────────────────────────
  {
    key: 'vless_xhttp_tls',
    name: 'VLESS + XHTTP + TLS',
    nameFa: 'VLESS + XHTTP + TLS',
    description: 'VLESS over XHTTP with TLS — CDN compatible, modern transport',
    descriptionFa: 'VLESS روی XHTTP با TLS — سازگار با CDN، انتقال مدرن',
    category: 'cdn',
    supportsCdn: true,
    antiDpi: 'medium',
    defaultPort: 2053,
    protocol: 'vless',
    buildSettings: () => ({
      clients: [],
      decryption: 'none',
      encryption: 'none',
      fallbacks: [],
    }),
    buildStreamSettings: () => baseXhttpStream('/vless-xhttp', ''),
  },

  // ── Trojan + WebSocket + TLS ────────────────────────────────────────────
  {
    key: 'trojan_ws_tls',
    name: 'Trojan + WebSocket + TLS',
    nameFa: 'Trojan + WebSocket + TLS',
    description: 'Trojan over WebSocket with TLS — CDN compatible',
    descriptionFa: 'Trojan روی WebSocket با TLS — سازگار با CDN',
    category: 'cdn',
    supportsCdn: true,
    antiDpi: 'high',
    defaultPort: 2083,
    protocol: 'trojan',
    buildSettings: () => ({ clients: [], fallbacks: [] }),
    buildStreamSettings: () => baseTlsStream('', '/trojan-ws', ''),
  },

  // ── Trojan + gRPC + TLS ─────────────────────────────────────────────────
  {
    key: 'trojan_grpc_tls',
    name: 'Trojan + gRPC + TLS',
    nameFa: 'Trojan + gRPC + TLS',
    description: 'Trojan over gRPC with TLS — CDN compatible, HTTP/2',
    descriptionFa: 'Trojan روی gRPC با TLS — سازگار با CDN، HTTP/2',
    category: 'cdn',
    supportsCdn: true,
    antiDpi: 'high',
    defaultPort: 2083,
    protocol: 'trojan',
    buildSettings: () => ({ clients: [], fallbacks: [] }),
    buildStreamSettings: () => baseGrpcStream('trojan-grpc', ''),
  },

  // ── gRPC + TLS ──────────────────────────────────────────────────────────
  {
    key: 'vless_grpc_tls',
    name: 'VLESS + gRPC + TLS',
    nameFa: 'VLESS + gRPC + TLS',
    description: 'VLESS over gRPC with TLS — CDN compatible, HTTP/2 streaming',
    descriptionFa: 'VLESS روی gRPC با TLS — سازگار با CDN، استریم HTTP/2',
    category: 'cdn',
    supportsCdn: true,
    antiDpi: 'medium',
    defaultPort: 2054,
    protocol: 'vless',
    buildSettings: () => ({
      clients: [],
      decryption: 'none',
      encryption: 'none',
      fallbacks: [],
    }),
    buildStreamSettings: () => baseGrpcStream('vless-grpc', ''),
  },

  // ── HTTPUpgrade + TLS ───────────────────────────────────────────────────
  {
    key: 'vless_httpupgrade_tls',
    name: 'VLESS + HTTPUpgrade + TLS',
    nameFa: 'VLESS + HTTPUpgrade + TLS',
    description: 'VLESS over HTTPUpgrade with TLS — CDN compatible',
    descriptionFa: 'VLESS روی HTTPUpgrade با TLS — سازگار با CDN',
    category: 'cdn',
    supportsCdn: true,
    antiDpi: 'medium',
    defaultPort: 2055,
    protocol: 'vless',
    buildSettings: () => ({
      clients: [],
      decryption: 'none',
      encryption: 'none',
      fallbacks: [],
    }),
    buildStreamSettings: () => baseHttpUpgradeStream('/vless-hu', ''),
  },

  // ── ShadowSocks 2022 ────────────────────────────────────────────────────
  {
    key: 'shadowsocks_2022',
    name: 'ShadowSocks 2022',
    nameFa: 'ShadowSocks 2022',
    description: 'ShadowSocks 2022-blake3-aes-256-gcm — modern cipher, CDN compatible',
    descriptionFa: 'ShadowSocks 2022-blake3-aes-256-gcm — رمزنگاری مدرن، سازگار با CDN',
    category: 'tls',
    supportsCdn: true,
    antiDpi: 'low',
    defaultPort: 2056,
    protocol: 'shadowsocks',
    buildSettings: () => {
      const method = '2022-blake3-aes-256-gcm';
      return {
        method,
        password: RandomUtil.randomShadowsocksPassword(method),
        network: 'tcp',
        clients: [],
        ivCheck: false,
      };
    },
    buildStreamSettings: () => ({
      network: 'tcp',
      security: 'none',
      tcpSettings: { header: { type: 'none' } },
    }),
  },

  // ── ShadowSocks 2022 + WebSocket + TLS ─────────────────────────────────
  {
    key: 'shadowsocks_2022_ws_tls',
    name: 'ShadowSocks 2022 + WebSocket + TLS',
    nameFa: 'ShadowSocks 2022 + WebSocket + TLS',
    description: 'ShadowSocks 2022 over WebSocket with TLS — CDN compatible',
    descriptionFa: 'ShadowSocks 2022 روی WebSocket با TLS — سازگار با CDN',
    category: 'cdn',
    supportsCdn: true,
    antiDpi: 'medium',
    defaultPort: 2056,
    protocol: 'shadowsocks',
    buildSettings: () => {
      const method = '2022-blake3-aes-256-gcm';
      return {
        method,
        password: RandomUtil.randomShadowsocksPassword(method),
        network: 'tcp,udp',
        clients: [],
        ivCheck: false,
      };
    },
    buildStreamSettings: () => baseTlsStream('', '/ss-ws', ''),
  },

  // ── Hysteria2 ───────────────────────────────────────────────────────────
  {
    key: 'hysteria2',
    name: 'Hysteria2 (QUIC/UDP)',
    nameFa: 'Hysteria2 (QUIC/UDP)',
    description: 'Hysteria2 over QUIC/UDP with TLS — high speed, anti-DPI',
    descriptionFa: 'Hysteria2 روی QUIC/UDP با TLS — سرعت بالا، ضد سانسور',
    category: 'quic',
    supportsCdn: false,
    antiDpi: 'high',
    defaultPort: 8443,
    protocol: 'hysteria',
    buildSettings: () => ({
      version: 2,
      clients: [],
    }),
    buildStreamSettings: () => ({
      network: 'hysteria',
      security: 'tls',
      hysteriaSettings: {
        version: 2,
        auth: '',
        udpIdleTimeout: '30s',
        masquerade: '',
      },
      tlsSettings: {
        serverName: '',
        alpn: ['h3'],
        certificates: [
          {
            useFile: true,
            certificateFile: '',
            keyFile: '',
            certificate: [],
            key: [],
            oneTimeLoading: false,
            usage: 'encipherment',
            buildChain: false,
          },
        ],
        settings: { allowInsecure: false, fingerprint: '' },
      },
      finalmask: {
        tcp: [],
        udp: [
          {
            type: 'salamander',
            settings: { password: RandomUtil.randomLowerAndNum(16) },
          },
        ],
      },
    }),
  },

  // ── WireGuard ───────────────────────────────────────────────────────────
  {
    key: 'wireguard',
    name: 'WireGuard (UDP)',
    nameFa: 'WireGuard (UDP)',
    description: 'WireGuard over UDP — fast, simple VPN protocol',
    descriptionFa: 'WireGuard روی UDP — پروتکل VPN سریع و ساده',
    category: 'plain',
    supportsCdn: false,
    antiDpi: 'low',
    defaultPort: 51820,
    protocol: 'wireguard',
    buildSettings: () => ({
      mtu: 1420,
      secretKey: '',
      peers: [
        {
          privateKey: '',
          publicKey: '',
          allowedIPs: ['10.0.0.2/32'],
          keepAlive: 0,
        },
      ],
      noKernelTun: false,
    }),
    buildStreamSettings: () => ({}),
  },
];

/** Group presets by category */
export function groupPresetsByCategory(presets: ProtocolPreset[]): Record<PresetCategory, ProtocolPreset[]> {
  const groups: Record<PresetCategory, ProtocolPreset[]> = {
    reality: [],
    cdn: [],
    tls: [],
    quic: [],
    obfs: [],
    plain: [],
  };
  for (const p of presets) {
    groups[p.category].push(p);
  }
  return groups;
}

/** Category display info */
export const CATEGORY_META: Record<PresetCategory, { label: string; labelFa: string; color: string }> = {
  reality: { label: 'Reality', labelFa: 'Reality', color: 'purple' },
  cdn: { label: 'CDN Compatible', labelFa: 'سازگار با CDN', color: 'blue' },
  tls: { label: 'TLS', labelFa: 'TLS', color: 'green' },
  quic: { label: 'QUIC/UDP', labelFa: 'QUIC/UDP', color: 'cyan' },
  obfs: { label: 'Obfuscation', labelFa: 'مبهم‌سازی', color: 'orange' },
  plain: { label: 'Plain', labelFa: 'ساده', color: 'default' },
};
