export type HeroVisualMode = "panel-right" | "panel-left" | "background";
export type HeroVisualPosition = "right" | "left" | "background";
export type HeroVisualSource = "none" | "url" | "asset";
export type HeroVisualRole = "image" | "icon" | "background" | "svg";

export type HeroVisualRecord = Record<string, string> & {
	visual_source?: string;
	visual_role?: string;
	visual_src?: string;
	visual_asset_id?: string;
	visual_mode?: string;
	visual_position?: string;
};

export function normalizeHeroVisualToken(value: string | undefined): HeroVisualMode | "" {
	const raw = String(value || "").trim().toLowerCase().replaceAll("_", "-");
	if (!raw) return "";
	if (raw === "background" || raw === "bg" || raw === "image-background") return "background";
	if (["panel-left", "left", "image-left", "visual-left"].includes(raw)) return "panel-left";
	if (["panel-right", "right", "image-right", "visual-right"].includes(raw)) return "panel-right";
	return "";
}

export function normalizeHeroVisualSource(value: string | undefined, visualSrc = "", visualAssetId = ""): HeroVisualSource {
	if (String(visualSrc || "").trim()) return "url";
	const raw = String(value || "").trim().toLowerCase();
	if (raw === "url" || raw === "asset" || raw === "none") return raw;
	if (String(visualAssetId || "").trim()) return "asset";
	return "none";
}

export function normalizeHeroVisualRole(value: string | undefined, fallbackMode = ""): HeroVisualRole {
	const raw = String(value || "").trim().toLowerCase().replaceAll("_", "-");
	if (raw === "image" || raw === "icon" || raw === "background" || raw === "svg") return raw;
	return normalizeHeroVisualToken(fallbackMode) === "background" ? "background" : "image";
}

export function visualPositionForMode(mode: string | undefined): HeroVisualPosition {
	const normalized = normalizeHeroVisualToken(mode);
	if (normalized === "background") return "background";
	if (normalized === "panel-left") return "left";
	return "right";
}

export function modeForVisualPosition(position: string | undefined): HeroVisualMode | "" {
	const normalized = normalizeHeroVisualToken(position);
	if (normalized === "background") return "background";
	if (normalized === "panel-left") return "panel-left";
	if (normalized === "panel-right") return "panel-right";
	return "";
}

export function resolveHeroVisualRole(record: HeroVisualRecord): HeroVisualRole {
	return normalizeHeroVisualRole(record.visual_role, record.visual_mode || record.visual_position);
}

export function resolveHeroVisualSource(record: HeroVisualRecord): HeroVisualSource {
	return normalizeHeroVisualSource(record.visual_source, record.visual_src, record.visual_asset_id);
}

export function resolveHeroVisualMode(record: HeroVisualRecord): HeroVisualMode {
	const role = resolveHeroVisualRole(record);
	if (role === "background") return "background";
	const mode = normalizeHeroVisualToken(record.visual_mode);
	const position = modeForVisualPosition(record.visual_position);
	return mode || position || "panel-right";
}

export function normalizeHeroVisualFields<TRecord extends Record<string, string>>(record: TRecord): TRecord {
	const mutableRecord = record as TRecord & {
		visual_source: string;
		visual_role: string;
		visual_mode: string;
		visual_position: string;
	};
	const source = normalizeHeroVisualSource(mutableRecord.visual_source, mutableRecord.visual_src, mutableRecord.visual_asset_id);
	const role = normalizeHeroVisualRole(mutableRecord.visual_role, mutableRecord.visual_mode || mutableRecord.visual_position);
	const mode = role === "background" ? "background" : resolveHeroVisualMode(mutableRecord);
	mutableRecord.visual_source = source;
	mutableRecord.visual_role = role;
	mutableRecord.visual_mode = mode;
	mutableRecord.visual_position = visualPositionForMode(mode);
	return record;
}
