import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleService } from '../../../services/vehicleService';
import { AdminPreviewBar } from '../../../components/admin/AdminPreviewBar';
import { VehicleDetailsPage } from '../../VehicleDetails';

export const VehiclePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    document.title = 'Vehicle Preview Mode | Admin CMS';
    let isMounted = true;
    const load = async () => {
      if (id) {
        const data = await vehicleService.getVehicleById(id);
        if (isMounted) {
          setVehicle(data);
        }
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleBackToEditor = () => {
    navigate(`/admin/vehicles/${id}/edit`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Preview Mode Sticky Banner */}
      <AdminPreviewBar
        vehicleName={vehicle?.name || 'Vehicle'}
        onBackToEditor={handleBackToEditor}
      />

      {/* Render Public Vehicle Details Page view using Current Vehicle Data */}
      <main className="flex-1">
        <VehicleDetailsPage overrideVehicleId={id} />
      </main>
    </div>
  );
};
