import { Config } from '../shared/config';
import { HandlingAttribute, VehicleHandlingData } from '../shared/types';
import { getVehicleHandlingAttribute, setVehicleHandlingAttribute } from './handling';
import { getExport, QBCoreExport } from '../utils/getExport';

const QBCore = getExport<QBCoreExport>('qb-core').GetCoreObject();

// Caché de estado
const StockHandling: Record<string, VehicleHandlingData> = {};
const CurrentTunedHandling: Record<string, VehicleHandlingData> = {};

let inVehicle = false;
let currentVehicle = 0;
let currentModel = '';
let isAllowed = true;

/**
 * Refresca las físicas del vehículo en vivo y asegura el control de red.
 */
function refreshVehiclePhysics(vehicle: number): void {
  if (!DoesEntityExist(vehicle)) return;
  
  // Forzar recalculo de físicas (truco estándar de FiveM)
  ModifyVehicleTopSpeed(vehicle, 1.0);
  
  // Solicitar control de red si no lo tenemos
  if (!NetworkHasControlOfEntity(vehicle)) {
    NetworkRequestControlOfEntity(vehicle);
  }
}

/**
 * Aplica un perfil completo de handling al vehículo iterando sobre los atributos válidos.
 */
function applyTuningProfile(vehicle: number, profile: VehicleHandlingData): void {
  if (!DoesEntityExist(vehicle) || !profile) return;

  for (const attr of Config.validAttributes) {
    if (profile[attr] !== undefined) {
      setVehicleHandlingAttribute(vehicle, attr, profile[attr] as number);
    }
  }

  refreshVehiclePhysics(vehicle);
}

// Bucle de comprobación (Reemplazo de Citizen.CreateThread / Citizen.Wait(500))
setInterval(() => {
  const ped = PlayerPedId();
  const veh = GetVehiclePedIsIn(ped, false);

  // Si estamos en un vehículo y somos el conductor (asiento -1)
  if (veh !== 0 && GetPedInVehicleSeat(veh, -1) === ped) {
    if (!inVehicle || currentVehicle !== veh) {
      inVehicle = true;
      currentVehicle = veh;
      
      const modelHash = GetEntityModel(veh);
      currentModel = GetDisplayNameFromVehicleModel(modelHash).toLowerCase();

      // Guardar el handling original de fábrica si no existe en caché
      if (!StockHandling[currentModel]) {
        StockHandling[currentModel] = {};
        for (const attr of Config.validAttributes) {
          StockHandling[currentModel]![attr] = getVehicleHandlingAttribute(veh, attr);
        }
      }

      // Enviar evento al servidor para obtener la configuración de la BD
      emitNet('vehiclehandling:fetchModelTuning', currentModel);
    }
  } else if (inVehicle) {
    inVehicle = false;
    currentVehicle = 0;
    currentModel = '';
  }
}, 500);

onNet('vehiclehandling:loadModelTuning', (modelName: string, profile: VehicleHandlingData | null) => {
  if (!inVehicle || currentModel !== modelName) return;
  
  if (profile) {
    CurrentTunedHandling[modelName] = profile;
    applyTuningProfile(currentVehicle, profile);
  } else {
    delete CurrentTunedHandling[modelName];
    if (StockHandling[modelName]) {
      applyTuningProfile(currentVehicle, StockHandling[modelName]);
    }
  }
});
onNet('vehiclehandling:refreshModelDrivers', (modelName: string) => {
  const ped = PlayerPedId();
  const veh = GetVehiclePedIsIn(ped, false);
  
  if (veh !== 0 && GetPedInVehicleSeat(veh, -1) === ped) {
    const modelHash = GetEntityModel(veh);
    const thisModelName = GetDisplayNameFromVehicleModel(modelHash).toLowerCase();
    
    if (thisModelName === modelName) {
      emitNet('vehiclehandling:fetchModelTuning', modelName);
    }
  }
});
onNet('vehiclehandling:client:setHandling', (attribute: HandlingAttribute, value: number) => {
  isAllowed = true;
  if (currentVehicle === 0) {
    QBCore.Functions.Notify('You must be driving a vehicle.', 'error');
    return;
  }
  emitNet('vehiclehandling:setAttribute', VehToNet(currentVehicle), attribute, value);
});
onNet('vehiclehandling:client:openEditor', () => {
  isAllowed = true;
  if (currentVehicle === 0) {
    QBCore.Functions.Notify('You must be driving a vehicle.', 'error');
    return;
  }
  let label = GetLabelText(GetDisplayNameFromVehicleModel(GetEntityModel(currentVehicle)));
  if (label === 'NULL') {
    label = currentModel;
  }
  const currentActive: VehicleHandlingData = {};
  for (const attr of Config.validAttributes) {
    currentActive[attr] = getVehicleHandlingAttribute(currentVehicle, attr);
  }
  const stockValues = StockHandling[currentModel] || currentActive;
  // Dar foco al ratón y teclado para la interfaz web
  SetNuiFocus(true, true);
  
  // Enviar mensaje al frontend (Chromium)
  SendNUIMessage({
    action: 'open',
    model: currentModel,
    label: label,
    handling: currentActive,
    stock: stockValues
  });
});
onNet('vehiclehandling:applyAttribute', (netId: number, attribute: HandlingAttribute, value: number) => {
  if (NetworkDoesEntityExistWithNetworkId(netId)) {
    const vehicle = NetToVeh(netId);
    if (DoesEntityExist(vehicle)) {
      setVehicleHandlingAttribute(vehicle, attribute, value);
      refreshVehiclePhysics(vehicle);
    }
  }
});
// ==========================================
// CALLBACKS NUI (Frontend -> Client)
// ==========================================
/**
 * Wrapper tipado para registrar NUI Callbacks de forma limpia.
 */
function registerCallback<T = any>(name: string, handler: (data: T, cb: (response: any) => void) => void) {
  RegisterNuiCallbackType(name);
  on(`__cfx_nui:${name}`, handler);
}
registerCallback<{ attribute: HandlingAttribute, value: number }>('applyValue', (data, cb) => {
  if (currentVehicle !== 0 && data.attribute && data.value !== undefined) {
    setVehicleHandlingAttribute(currentVehicle, data.attribute, data.value);
    refreshVehiclePhysics(currentVehicle);
  }
  cb('ok');
});
registerCallback<{ model: string, handling: VehicleHandlingData }>('saveTuning', (data, cb) => {
  if (isAllowed) {
    emitNet('vehiclehandling:saveModelTuning', data.model, data.handling);
  }
  cb('ok');
});
registerCallback<{ model: string }>('resetStock', (data, cb) => {
  if (isAllowed) {
    emitNet('vehiclehandling:deleteModelTuning', data.model);
  }
  cb('ok');
});
registerCallback('closeUI', (_, cb) => {
  SetNuiFocus(false, false);
  cb('ok');
});
// Respuestas simples de la UI
registerCallback('copied', (data: { success: boolean }, cb) => {
  if (data?.success) {
    QBCore.Functions.Notify('Handling configurations copied to system clipboard!', 'success');
  } else {
    QBCore.Functions.Notify('Failed to write to system clipboard.', 'error');
  }
  cb('ok');
});
registerCallback('xmlImported', (data: { count: number }, cb) => {
  if (data?.count && data.count > 0) {
    QBCore.Functions.Notify(`Successfully imported ${data.count} handling parameters!`, 'success');
  } else {
    QBCore.Functions.Notify('No valid handling parameters found in the XML.', 'error');
  }
  cb('ok');
});