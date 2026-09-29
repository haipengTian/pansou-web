import { ref } from 'vue';
import { getSettings, updateSettings, errorMessage, type AdminSettings } from '@/api/admin';

// 插件页与频道页各自只改设置的一部分，但后端按整体替换保存，
// 所以统一在这里"读取最新 → 合并修改 → 整体提交"。
export function useSettings() {
  const settings = ref<AdminSettings | null>(null);
  const pluginSystemEnabled = ref(true);
  const loading = ref(false);
  const saving = ref(false);
  const error = ref('');
  const notice = ref('');

  const load = async () => {
    loading.value = true;
    error.value = '';
    try {
      const data = await getSettings();
      settings.value = data.settings;
      pluginSystemEnabled.value = data.plugin_system_enabled;
    } catch (err) {
      error.value = errorMessage(err, '加载设置失败');
    } finally {
      loading.value = false;
    }
  };

  const save = async (patch: Partial<AdminSettings>) => {
    saving.value = true;
    error.value = '';
    notice.value = '';
    try {
      const latest = (await getSettings()).settings;
      const result = await updateSettings({ ...latest, ...patch });
      settings.value = result.settings;
      const failed = Object.entries(result.failed_plugins || {});
      notice.value = failed.length
        ? `已保存，但以下插件初始化失败未启用：${failed.map(([name, reason]) => `${name}（${reason}）`).join('；')}`
        : '已保存并立即生效';
      return true;
    } catch (err) {
      error.value = errorMessage(err, '保存失败');
      return false;
    } finally {
      saving.value = false;
    }
  };

  return { settings, pluginSystemEnabled, loading, saving, error, notice, load, save };
}
