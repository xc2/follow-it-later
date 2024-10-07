import { useTranslation } from "@edenx/runtime/intl";
import { ReactNode, useMemo } from "react";
import { selectText } from "@/shared/i18n";
import _dayjs, { ConfigType, Dayjs, OptionType } from "dayjs";
import dayjsZhCN from "dayjs/locale/zh-cn";

import RelativeTime from "dayjs/plugin/relativeTime";
import WeekOfYear from "dayjs/plugin/weekOfYear";
import AdvancedFormat from "dayjs/plugin/advancedFormat";
import WeekYear from "dayjs/plugin/weekYear";
import LocalizedFormat from "dayjs/plugin/localizedFormat";

_dayjs.extend(RelativeTime);
_dayjs.extend(AdvancedFormat);
_dayjs.extend(WeekOfYear);
_dayjs.extend(WeekYear);
_dayjs.extend(LocalizedFormat);

export function useIsZh() {
  const { i18n } = useTranslation();
  return useMemo(() => (i18n.language || "").startsWith("zh"), [i18n.language]);
}

export function useTextSelect() {
  const { i18n } = useTranslation();
  return useMemo(() => selectText(i18n.language), [i18n.language]);
}

export function useDayjs() {
  const isZh = useIsZh();
  return useMemo(() => {
    function dayjs(date?: ConfigType): Dayjs;
    function dayjs(date?: ConfigType, format?: OptionType, strict?: boolean): Dayjs;
    function dayjs(
      date?: ConfigType,
      format?: OptionType,
      locale?: string,
      strict?: boolean
    ): Dayjs;
    function dayjs(...args: any[]): Dayjs {
      const d = _dayjs(...args);
      return isZh ? d.locale(dayjsZhCN) : d;
    }
    return dayjs;
  }, [isZh]);
}

export function asReactNode(fn: (t: any) => ReactNode) {
  function C() {
    const [t] = useTranslation();
    return (fn(t) as JSX.Element) || null;
  }
  return <C />;
}
