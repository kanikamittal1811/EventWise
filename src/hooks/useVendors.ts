import { useMemo } from 'react';
import { useEvent } from './useEvent';
import { VendorService } from '../services/vendor/vendorService';
import { VendorFormData } from '../schemas/vendor.schema';
import { Vendor } from '../types/vendor';

export function useVendors() {
  const { event } = useEvent();

  const vendors = useMemo(() => {
    if (!event?.vendors) return [];
    return Object.values(event.vendors).sort((a, b) => b.createdAt - a.createdAt);
  }, [event?.vendors]);

  const addVendor = async (data: VendorFormData) => {
    if (!event) return;
    return await VendorService.addVendor(event.id, data);
  };

  const updateVendor = async (vendorId: string, updates: Partial<Vendor>) => {
    if (!event) return;
    await VendorService.updateVendor(event.id, vendorId, updates);
  };

  const deleteVendor = async (vendorId: string) => {
    if (!event) return;
    await VendorService.deleteVendor(event.id, vendorId);
  };

  const attachImage = async (vendorId: string, imageId: string) => {
    if (!event) return;
    await VendorService.attachImage(event.id, vendorId, imageId);
  };

  return {
    vendors,
    addVendor,
    updateVendor,
    deleteVendor,
    attachImage,
  };
}

