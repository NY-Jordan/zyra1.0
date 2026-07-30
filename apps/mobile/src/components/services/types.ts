export type ServiceCategory = {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  servicesCount: number;
};

export type Service = {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  price: number;
  duration: number;
  isActive: boolean;
};

export const MOCK_CATEGORIES: ServiceCategory[] = [
  { id: 'c1', name: 'Coupes', description: 'Coupes homme, femme et enfant', isActive: true, servicesCount: 3 },
  { id: 'c2', name: 'Coiffure', description: 'Tresses, coloration, brushing', isActive: true, servicesCount: 3 },
  { id: 'c3', name: 'Barbe', isActive: true, servicesCount: 1 },
  { id: 'c4', name: 'Manucure', isActive: false, servicesCount: 0 },
];

export const MOCK_SERVICES: Service[] = [
  { id: 's1', name: 'Coupe Homme', categoryId: 'c1', categoryName: 'Coupes', price: 3000, duration: 30, isActive: true },
  { id: 's2', name: 'Coupe + Brushing', categoryId: 'c1', categoryName: 'Coupes', price: 15000, duration: 45, isActive: true },
  { id: 's3', name: 'Dégradé', categoryId: 'c1', categoryName: 'Coupes', price: 5000, duration: 30, isActive: true },
  { id: 's4', name: 'Tresses', categoryId: 'c2', categoryName: 'Coiffure', price: 25000, duration: 120, isActive: true },
  { id: 's5', name: 'Coloration', categoryId: 'c2', categoryName: 'Coiffure', price: 18000, duration: 90, isActive: true },
  { id: 's6', name: 'Brushing', categoryId: 'c2', categoryName: 'Coiffure', price: 8000, duration: 40, isActive: false },
  { id: 's7', name: 'Barbe', categoryId: 'c3', categoryName: 'Barbe', price: 3000, duration: 20, isActive: true },
];
