// types/index.ts
export interface Category {
  id: string;
  storeId: string;
  billboardId: string;
  name: string;
  iconId: string;
  iconvalue: string;
  createdAt: string;
  updatedAt: string;
  billboard?: Billboard;
  icon?: Icon;
  products?: Product[];
}

export interface Billboard {
  id: string;
  storeId: string;
  label: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Icon {
  id: string;
  storeId: string;
  name: string;
  iconvalue: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  storeId: string;
  categoryId: string;
  name: string;
  price: string;
  isFeatured: boolean;
  isArchived: boolean;
  sizeId: string;
  colorId: string;
  createdAt: string;
  updatedAt: string;
  images?: Image[];
  size?: Size;
  color?: Color;
}

export interface Image {
  id: string;
  productId: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface Size {
  id: string;
  storeId: string;
  name: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface Color {
  id: string;
  storeId: string;
  name: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}