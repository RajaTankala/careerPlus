import { Injectable, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { ToastService } from './toast.service';

export interface CloudSyncConfig {
  githubToken: string;
  gistId: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

const CLOUD_SYNC_KEY = 'careerpulse_cloud_sync_config_v1';

@Injectable({
  providedIn: 'root',
})
export class CloudSyncService {
  private readonly storage = inject(StorageService);
  private readonly toast = inject(ToastService);

  public readonly syncConfig = signal<CloudSyncConfig>({
    githubToken: '',
    gistId: '',
    autoSync: false,
  });

  public readonly isSyncing = signal<boolean>(false);
  public readonly syncError = signal<string | null>(null);

  constructor() {
    this.loadConfig();

    // If autoSync is enabled and credentials exist, sync on boot
    if (this.syncConfig().autoSync && this.syncConfig().gistId && this.syncConfig().githubToken) {
      setTimeout(() => {
        this.pullFromGist(false);
      }, 1500);
    }
  }

  public saveConfig(config: CloudSyncConfig): void {
    this.syncConfig.set(config);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CLOUD_SYNC_KEY, JSON.stringify(config));
    }
  }

  /**
   * Pushes the current workspace data to a Private GitHub Gist
   */
  public async pushToGist(): Promise<boolean> {
    const config = this.syncConfig();
    if (!config.githubToken.trim()) {
      this.toast.show('warning', 'Token Missing', 'Please enter a GitHub Personal Access Token (with gist scope).');
      return false;
    }

    this.isSyncing.set(true);
    this.syncError.set(null);

    const payload = this.storage.exportDataJson();
    const filesObj = {
      'careerpulse_workspace_data.json': {
        content: payload,
      },
    };

    try {
      let response: Response;
      let gistId = config.gistId.trim();

      if (gistId) {
        // Update existing Gist
        response = await fetch(`https://api.github.com/gists/${gistId}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${config.githubToken.trim()}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: 'CareerPulse Pro — Personal Career & Work Data Sync',
            files: filesObj,
          }),
        });
      } else {
        // Create new private Gist
        response = await fetch(`https://api.github.com/gists`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.githubToken.trim()}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: 'CareerPulse Pro — Personal Career & Work Data Sync',
            public: false,
            files: filesObj,
          }),
        });
      }

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || `GitHub API error (HTTP ${response.status})`);
      }

      const resData = await response.json();
      gistId = resData.id;

      const nowTime = new Date().toLocaleString();
      this.saveConfig({
        ...config,
        gistId,
        lastSyncedAt: nowTime,
      });

      this.toast.show(
        'success',
        '☁️ Cloud Backup Successful!',
        `Your data was safely pushed to your private GitHub Gist (ID: ${gistId.substring(0, 8)}...).`
      );
      this.isSyncing.set(false);
      return true;
    } catch (err: any) {
      this.isSyncing.set(false);
      const msg = err.message || 'Failed to connect to GitHub API';
      this.syncError.set(msg);
      this.toast.show('error', 'Sync Failed', msg);
      return false;
    }
  }

  /**
   * Pulls data from the GitHub Gist and updates the local UI workspace
   */
  public async pullFromGist(notifySuccess: boolean = true): Promise<boolean> {
    const config = this.syncConfig();
    const gistId = config.gistId.trim();

    if (!gistId) {
      this.toast.show('warning', 'Gist ID Required', 'Please provide your GitHub Gist ID to pull data.');
      return false;
    }

    this.isSyncing.set(true);
    this.syncError.set(null);

    try {
      const headers: Record<string, string> = {
        Accept: 'application/vnd.github+json',
      };
      if (config.githubToken.trim()) {
        headers['Authorization'] = `Bearer ${config.githubToken.trim()}`;
      }

      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || `HTTP ${response.status} fetching Gist`);
      }

      const resData = await response.json();
      const file = resData.files?.['careerpulse_workspace_data.json'];

      if (!file || !file.content) {
        throw new Error('Gist does not contain careerpulse_workspace_data.json file.');
      }

      const importResult = this.storage.importDataJson(file.content);
      if (!importResult.success) {
        throw new Error(importResult.message);
      }

      const nowTime = new Date().toLocaleString();
      this.saveConfig({
        ...config,
        lastSyncedAt: nowTime,
      });

      if (notifySuccess) {
        this.toast.show(
          'success',
          '☁️ Cloud Data Synchronized!',
          `Loaded ${this.storage.totalRecordsCount()} records from GitHub Gist into this browser.`
        );
      }

      this.isSyncing.set(false);
      return true;
    } catch (err: any) {
      this.isSyncing.set(false);
      const msg = err.message || 'Failed to pull data from GitHub Gist';
      this.syncError.set(msg);
      this.toast.show('error', 'Pull Failed', msg);
      return false;
    }
  }

  private loadConfig(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(CLOUD_SYNC_KEY);
      if (raw) {
        this.syncConfig.set(JSON.parse(raw));
      }
    } catch (e) {
      console.warn('Failed to parse CloudSync config', e);
    }
  }
}
