import apiClient from "../../../common/api/apiClient";

export interface Asset {
  id: string;
  assetTag: string;
  deviceName: string;
  type: string;
  brand: string;
  model: string;
  price: number;
  status: string;
  condition: string;
  assignedTo?: string | null;
  previousUser?: string | null;
  serialNumber: string;
  department?: string | null;
  hasMouse: boolean;
  hasKeyboard: boolean;
  hasMonitor: boolean;
  mouseSerial?: string | null;
  keyboardSerial?: string | null;
  monitorSerial?: string | null;
  remarks?: string | null;
  createdByName: string;
  purchaseDate?: string | null;
  qr: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetPayload {
  deviceName: string;
  type: string;
  brand: string;
  model: string;
  price: number;
  status: string;
  condition: string;
  assignedTo?: string;
  previousUser?: string;
  serialNumber: string;
  department?: string;
  hasMouse: boolean;
  hasKeyboard: boolean;
  hasMonitor: boolean;
  mouseSerial?: string;
  keyboardSerial?: string;
  monitorSerial?: string;
  remarks?: string;
  purchaseDate?: string;
  manualAssetTag?: string;
}

export async function fetchAssets(): Promise<Asset[]> {
  const res = await apiClient.get<Asset[]>("/it/assets");
  return res.data;
}

export async function createAsset(payload: CreateAssetPayload): Promise<Asset> {
  const res = await apiClient.post<Asset>("/it/assets", payload);
  return res.data;
}
export interface UpdateAssetPayload {
  deviceName: string;
  type: string;
  brand: string;
  model: string;
  price: number;
  status: string;
  condition: string;
  assignedTo?: string;
  previousUser?: string;
  serialNumber: string;
  department?: string;
  hasMouse: boolean;
  hasKeyboard: boolean;
  hasMonitor: boolean;
  mouseSerial?: string;
  keyboardSerial?: string;
  monitorSerial?: string;
  remarks?: string;
  purchaseDate?: string;
}

export interface PublicAssetHistoryEntry {
  partComponent: string;
  dateOfReplacement: string;
  notes?: string | null;
}

export interface PublicAsset {
  assetTag: string;
  deviceName: string;
  type: string;
  brand: string;
  model: string;
  serialNumber: string;
  status: string;
  condition: string;
  assignedTo?: string | null;
  department?: string | null;
  hasMouse: boolean;
  hasKeyboard: boolean;
  hasMonitor: boolean;
  mouseSerial?: string | null;
  keyboardSerial?: string | null;
  monitorSerial?: string | null;
  history: PublicAssetHistoryEntry[];
}

export async function updateAsset(
  id: string,
  payload: UpdateAssetPayload,
): Promise<Asset> {
  const res = await apiClient.put<Asset>(`/it/assets/${id}`, payload);
  return res.data;
}

export async function fetchAssetByTag(assetTag: string): Promise<PublicAsset> {
  const res = await apiClient.get<PublicAsset>(`/it/assets/tag/${assetTag}`);
  return res.data;
}
export async function deleteAsset(id: string): Promise<void> {
  await apiClient.delete(`/it/assets/${id}`);
}
export interface AssetHistoryEntry {
  id: string;
  assetId: string;
  partComponent: string;
  serialNumber?: string | null;
  datePurchased?: string | null;
  dateOfReplacement: string;
  notes?: string | null;
  createdAt: string;
}

export interface CreateAssetHistoryPayload {
  assetId: string;
  partComponent: string;
  serialNumber?: string;
  datePurchased?: string;
  dateOfReplacement: string;
  notes?: string;
}

export async function fetchAssetHistory(
  assetId: string,
): Promise<AssetHistoryEntry[]> {
  const res = await apiClient.get<AssetHistoryEntry[]>(
    `/it/assets/${assetId}/history`,
  );
  return res.data;
}

export async function createAssetHistory(
  payload: CreateAssetHistoryPayload,
): Promise<AssetHistoryEntry> {
  const res = await apiClient.post<AssetHistoryEntry>(
    "/it/assets/history",
    payload,
  );
  return res.data;
}
