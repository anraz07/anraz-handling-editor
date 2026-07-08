local QBCore = exports['qb-core']:GetCoreObject()

local StockHandling = {} -- Cache for default vehicle profiles: [modelName] = { fMass = ..., ... }
local CurrentTunedHandling = {} -- Currently active DB profile: [modelName] = { fMass = ..., ... }

local inVehicle = false
local currentVehicle = 0
local currentModel = ""
local isAllowed = true

-- Sub-handling fields that exist within the CCarHandlingData class instead of CHandlingData
local SubHandlingAttributes = {
    fBackEndPopUpCarImpulseMult = true,
    fBackEndPopUpBuildingImpulseMult = true,
    fBackEndPopUpMaxDeltaSpeed = true,
    fToeFront = true,
    fToeRear = true,
    fCamberFront = true,
    fCamberRear = true,
    fCastor = true,
    fMaxDriveBiasTransfer = true,
    fJumpForceScale = true,
    fIncreasedRammingForceScale = true,
    strAdvancedFlags = true
}

-- Helper to check if player has permission (set by server validation)
local function IsPlayerAllowed()
    return isAllowed
end

-- Differentiated Getter for Handling attributes based on type prefixes and sub-handling classes
local function GetHandlingValue(vehicle, attr)
    if not DoesEntityExist(vehicle) then return nil end
    
    local handlingClass = SubHandlingAttributes[attr] and "CCarHandlingData" or "CHandlingData"

    if attr:sub(1, 3) == "vec" then
        local baseName, component = attr:match("^(vec%w+)_(%w)$")
        if baseName and component then
            local vec = GetVehicleHandlingVector(vehicle, handlingClass, baseName)
            if vec then
                if component == "x" then return vec.x
                elseif component == "y" then return vec.y
                elseif component == "z" then return vec.z
                end
            end
        end
        return 0.0
    elseif attr:sub(1, 3) == "str" then
        return GetVehicleHandlingInt(vehicle, handlingClass, attr)
    elseif attr:sub(1, 1) == "n" then
        return GetVehicleHandlingInt(vehicle, handlingClass, attr)
    else
        return GetVehicleHandlingFloat(vehicle, handlingClass, attr)
    end
end

-- Differentiated Setter for Handling attributes based on type prefixes and sub-handling classes
local function SetHandlingValue(vehicle, attr, value)
    if not DoesEntityExist(vehicle) or value == nil then return end

    local handlingClass = SubHandlingAttributes[attr] and "CCarHandlingData" or "CHandlingData"

    if attr:sub(1, 3) == "vec" then
        local baseName, component = attr:match("^(vec%w+)_(%w)$")
        if baseName and component then
            local currentVec = GetVehicleHandlingVector(vehicle, handlingClass, baseName)
            if currentVec then
                local x, y, z = currentVec.x, currentVec.y, currentVec.z
                if component == "x" then x = tonumber(value) + 0.0
                elseif component == "y" then y = tonumber(value) + 0.0
                elseif component == "z" then z = tonumber(value) + 0.0
                end
                SetVehicleHandlingVector(vehicle, handlingClass, baseName, vector3(x, y, z))
            end
        end
    elseif attr:sub(1, 3) == "str" then
        local intVal = tonumber(value)
        if intVal then
            SetVehicleHandlingInt(vehicle, handlingClass, attr, math.floor(intVal))
        end
    elseif attr:sub(1, 1) == "n" then
        local intVal = tonumber(value)
        if intVal then
            SetVehicleHandlingInt(vehicle, handlingClass, attr, math.floor(intVal))
        end
    else
        local floatVal = tonumber(value)
        if floatVal then
            SetVehicleHandlingFloat(vehicle, handlingClass, attr, floatVal + 0.0)
        end
    end
end

-- Refresh vehicle physics live
local function RefreshVehiclePhysics(vehicle)
    if not DoesEntityExist(vehicle) then return end
    
    -- standard native to force recalculating drive force and drag values
    ModifyVehicleTopSpeed(vehicle, 1.0)
    
    -- Request control of the entity to guarantee network sync
    if not NetworkHasControlOfEntity(vehicle) then
        NetworkRequestControlOfEntity(vehicle)
    end
end

-- Apply custom handling profile to a vehicle entity
local function ApplyTuningProfile(vehicle, profile)
    if not DoesEntityExist(vehicle) or not profile then return end
    
    for _, attr in ipairs(Config.ValidAttributes) do
        if profile[attr] ~= nil then
            SetHandlingValue(vehicle, attr, profile[attr])
        end
    end
    
    RefreshVehiclePhysics(vehicle)
end

-- Thread to track vehicle driver seat entries
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(500)
        local ped = PlayerPedId()
        local veh = GetVehiclePedIsIn(ped, false)
        
        if veh ~= 0 and GetPedInVehicleSeat(veh, -1) == ped then
            if not inVehicle or currentVehicle ~= veh then
                inVehicle = true
                currentVehicle = veh
                
                local modelHash = GetEntityModel(veh)
                currentModel = GetDisplayNameFromVehicleModel(modelHash):lower()
                
                -- Cache default stock settings if not already cached
                if not StockHandling[currentModel] then
                    StockHandling[currentModel] = {}
                    for _, attr in ipairs(Config.ValidAttributes) do
                        StockHandling[currentModel][attr] = GetHandlingValue(veh, attr)
                    end
                end
                
                -- Fetch custom handling from database for this model
                TriggerServerEvent('vehiclehandling:fetchModelTuning', currentModel)
            end
        elseif inVehicle then
            inVehicle = false
            currentVehicle = 0
            currentModel = ""
        end
    end
end)

-- Receive model profile from server DB
RegisterNetEvent('vehiclehandling:loadModelTuning', function(modelName, profile)
    if not inVehicle or currentModel ~= modelName then return end
    
    if profile then
        CurrentTunedHandling[modelName] = profile
        ApplyTuningProfile(currentVehicle, profile)
    else
        CurrentTunedHandling[modelName] = nil
        -- Revert to cached stock handling if no custom DB profile exists
        if StockHandling[modelName] then
            ApplyTuningProfile(currentVehicle, StockHandling[modelName])
        end
    end
end)

-- Broadcast event: reload model profile for all drivers
RegisterNetEvent('vehiclehandling:refreshModelDrivers', function(modelName)
    local ped = PlayerPedId()
    local veh = GetVehiclePedIsIn(ped, false)
    
    if veh ~= 0 and GetPedInVehicleSeat(veh, -1) == ped then
        local modelHash = GetEntityModel(veh)
        local thisModelName = GetDisplayNameFromVehicleModel(modelHash):lower()
        
        if thisModelName == modelName then
            TriggerServerEvent('vehiclehandling:fetchModelTuning', modelName)
        end
    end
end)

-- Single attribute setter event (triggered from server command)
RegisterNetEvent('vehiclehandling:client:setHandling', function(attribute, value)
    isAllowed = true

    if not value then
        QBCore.Functions.Notify('Value must be a number.', 'error')
        return
    end

    local isValid = false
    for _, attr in ipairs(Config.ValidAttributes) do
        if attr == attribute then
            isValid = true
            break
        end
    end

    if not isValid then
        QBCore.Functions.Notify('Invalid attribute.', 'error')
        return
    end

    if currentVehicle == 0 then
        QBCore.Functions.Notify('You must be driving a vehicle.', 'error')
        return
    end

    TriggerServerEvent('vehiclehandling:setAttribute', VehToNet(currentVehicle), attribute, value)
end)

-- Editor Event: Open NUI tuning dashboard (triggered from server command)
RegisterNetEvent('vehiclehandling:client:openEditor', function()
    isAllowed = true

    if currentVehicle == 0 then
        QBCore.Functions.Notify('You must be driving a vehicle.', 'error')
        return
    end

    local label = GetLabelText(GetDisplayNameFromVehicleModel(GetEntityModel(currentVehicle)))
    if label == "NULL" then
        label = currentModel
    end

    -- Compile current handling profiles (Stock and Tuned)
    local currentActive = {}
    for _, attr in ipairs(Config.ValidAttributes) do
        currentActive[attr] = GetHandlingValue(currentVehicle, attr)
    end

    local stockValues = StockHandling[currentModel] or currentActive

    SetNuiFocus(true, true) -- Enable mouse and keyboard control
    SendNUIMessage({
        action = 'open',
        model = currentModel,
        label = label,
        handling = currentActive,
        stock = stockValues
    })
end)

-- NUI: Apply live adjustments instantly
RegisterNUICallback('applyValue', function(data, cb)
    if currentVehicle ~= 0 then
        local attr = data.attribute
        local val = data.value
        if attr and val ~= nil then
            SetHandlingValue(currentVehicle, attr, val)
            RefreshVehiclePhysics(currentVehicle)
        end
    end
    cb('ok')
end)

-- NUI: Save current profile to database
RegisterNUICallback('saveTuning', function(data, cb)
    if IsPlayerAllowed() then
        TriggerServerEvent('vehiclehandling:saveModelTuning', data.model, data.handling)
    end
    cb('ok')
end)

-- NUI: Reset profile back to default
RegisterNUICallback('resetStock', function(data, cb)
    if IsPlayerAllowed() then
        TriggerServerEvent('vehiclehandling:deleteModelTuning', data.model)
    end
    cb('ok')
end)

-- NUI: Close UI focus
RegisterNUICallback('closeUI', function(data, cb)
    SetNuiFocus(false, false)
    cb('ok')
end)

-- NUI: Copy formatting to system clipboard in exact format as message (2).txt
RegisterNUICallback('triggerClipboardCopy', function(data, cb)
    local handling = data.handling

    -- Helper to format flag values as pure hex strings (e.g. 440010 or 0)
    local function formatPureHex(val)
        if not val then return "0" end
        return string.format("%X", math.floor(tonumber(val) or 0))
    end

    -- Reconstruct the XML exactly as shown in message (2).txt
    local xml = ""
    xml = xml .. string.format("<fMass value=\"%.4f\" />\n", tonumber(handling['fMass']) or 1500.0)
    xml = xml .. string.format("      <fInitialDragCoeff value=\"%.4f\" />\n", tonumber(handling['fInitialDragCoeff']) or 10.0)
    xml = xml .. string.format("      <fDownforceModifier value=\"%.4f\" />\n", tonumber(handling['fDownforceModifier']) or 0.0)
    xml = xml .. string.format("      <fPercentSubmerged value=\"%.4f\" />\n", tonumber(handling['fPercentSubmerged']) or 85.0)
    xml = xml .. string.format("      <vecCentreOfMassOffset x=\"%.4f\" y=\"%.4f\" z=\"%.4f\" />\n", 
        tonumber(handling['vecCentreOfMassOffset_x']) or 0.0, 
        tonumber(handling['vecCentreOfMassOffset_y']) or 0.0, 
        tonumber(handling['vecCentreOfMassOffset_z']) or 0.0)
    xml = xml .. string.format("      <vecInertiaMultiplier x=\"%.4f\" y=\"%.4f\" z=\"%.4f\" />\n", 
        tonumber(handling['vecInertiaMultiplier_x']) or 1.0, 
        tonumber(handling['vecInertiaMultiplier_y']) or 1.0, 
        tonumber(handling['vecInertiaMultiplier_z']) or 1.0)
    xml = xml .. string.format("      <fDriveBiasFront value=\"%.4f\" />\n", tonumber(handling['fDriveBiasFront']) or 0.5)
    xml = xml .. string.format("      <nInitialDriveGears value=\"%d\" />\n", math.floor(tonumber(handling['nInitialDriveGears']) or 6))
    xml = xml .. string.format("      <fInitialDriveForce value=\"%.4f\" />\n", tonumber(handling['fInitialDriveForce']) or 0.25)
    xml = xml .. string.format("      <fDriveInertia value=\"%.4f\" />\n", tonumber(handling['fDriveInertia']) or 1.0)
    xml = xml .. string.format("      <fClutchChangeRateScaleUpShift value=\"%.4f\" />\n", tonumber(handling['fClutchChangeRateScaleUpShift']) or 1.0)
    xml = xml .. string.format("      <fClutchChangeRateScaleDownShift value=\"%.4f\" />\n", tonumber(handling['fClutchChangeRateScaleDownShift']) or 1.0)
    xml = xml .. string.format("      <fInitialDriveMaxFlatVel value=\"%.4f\" />\n", tonumber(handling['fInitialDriveMaxFlatVel']) or 150.0)
    xml = xml .. string.format("      <fBrakeForce value=\"%.4f\" />\n", tonumber(handling['fBrakeForce']) or 0.3)
    xml = xml .. string.format("      <fBrakeBiasFront value=\"%.4f\" />\n", tonumber(handling['fBrakeBiasFront']) or 0.5)
    xml = xml .. string.format("      <fHandBrakeForce value=\"%.4f\" />\n", tonumber(handling['fHandBrakeForce']) or 0.5)
    xml = xml .. string.format("      <fSteeringLock value=\"%.4f\" />\n", tonumber(handling['fSteeringLock']) or 35.0)
    xml = xml .. string.format("      <fTractionCurveMax value=\"%.4f\" />\n", tonumber(handling['fTractionCurveMax']) or 1.6)
    xml = xml .. string.format("      <fTractionCurveMin value=\"%.4f\" />\n", tonumber(handling['fTractionCurveMin']) or 1.2)
    xml = xml .. string.format("      <fTractionCurveLateral value=\"%.4f\" />\n", tonumber(handling['fTractionCurveLateral']) or 22.0)
    xml = xml .. string.format("      <fTractionSpringDeltaMax value=\"%.4f\" />\n", tonumber(handling['fTractionSpringDeltaMax']) or 0.15)
    xml = xml .. string.format("      <fLowSpeedTractionLossMult value=\"%.4f\" />\n", tonumber(handling['fLowSpeedTractionLossMult']) or 1.0)
    xml = xml .. string.format("      <fCamberStiffnesss value=\"%.4f\" />\n", tonumber(handling['fCamberStiffnesss']) or 0.0)
    xml = xml .. string.format("      <fTractionBiasFront value=\"%.4f\" />\n", tonumber(handling['fTractionBiasFront']) or 0.5)
    xml = xml .. string.format("      <fTractionLossMult value=\"%.4f\" />\n", tonumber(handling['fTractionLossMult']) or 1.0)
    xml = xml .. string.format("      <fSuspensionForce value=\"%.4f\" />\n", tonumber(handling['fSuspensionForce']) or 1.5)
    xml = xml .. string.format("      <fSuspensionCompDamp value=\"%.4f\" />\n", tonumber(handling['fSuspensionCompDamp']) or 0.2)
    xml = xml .. string.format("      <fSuspensionReboundDamp value=\"%.4f\" />\n", tonumber(handling['fSuspensionReboundDamp']) or 0.3)
    xml = xml .. string.format("      <fSuspensionUpperLimit value=\"%.4f\" />\n", tonumber(handling['fSuspensionUpperLimit']) or 0.1)
    xml = xml .. string.format("      <fSuspensionLowerLimit value=\"%.4f\" />\n", tonumber(handling['fSuspensionLowerLimit']) or -0.1)
    xml = xml .. string.format("      <fSuspensionRaise value=\"%.4f\" />\n", tonumber(handling['fSuspensionRaise']) or 0.0)
    xml = xml .. string.format("      <fSuspensionBiasFront value=\"%.4f\" />\n", tonumber(handling['fSuspensionBiasFront']) or 0.5)
    xml = xml .. string.format("      <fAntiRollBarForce value=\"%.4f\" />\n", tonumber(handling['fAntiRollBarForce']) or 0.0)
    xml = xml .. string.format("      <fAntiRollBarBiasFront value=\"%.4f\" />\n", tonumber(handling['fAntiRollBarBiasFront']) or 0.5)
    xml = xml .. string.format("      <fRollCentreHeightFront value=\"%.4f\" />\n", tonumber(handling['fRollCentreHeightFront']) or 0.0)
    xml = xml .. string.format("      <fRollCentreHeightRear value=\"%.4f\" />\n", tonumber(handling['fRollCentreHeightRear']) or 0.0)
    xml = xml .. string.format("      <fCollisionDamageMult value=\"%.4f\" />\n", tonumber(handling['fCollisionDamageMult']) or 1.0)
    xml = xml .. string.format("      <fWeaponDamageMult value=\"%.4f\" />\n", tonumber(handling['fWeaponDamageMult']) or 1.0)
    xml = xml .. string.format("      <fDeformationDamageMult value=\"%.4f\" />\n", tonumber(handling['fDeformationDamageMult']) or 1.0)
    xml = xml .. string.format("      <fEngineDamageMult value=\"%.4f\" />\n", tonumber(handling['fEngineDamageMult']) or 1.0)
    xml = xml .. string.format("      <fPetrolTankVolume value=\"%.4f\" />\n", tonumber(handling['fPetrolTankVolume']) or 65.0)
    xml = xml .. string.format("      <fPetrolConsumptionRate value=\"%.4f\" />\n", tonumber(handling['fPetrolConsumptionRate']) or 0.5)
    xml = xml .. string.format("      <fOilVolume value=\"%.4f\" />\n", tonumber(handling['fOilVolume']) or 5.0)
    xml = xml .. string.format("      <fSeatOffsetDistX value=\"%.4f\" />\n", tonumber(handling['fSeatOffsetDistX']) or 0.0)
    xml = xml .. string.format("      <fSeatOffsetDistY value=\"%.4f\" />\n", tonumber(handling['fSeatOffsetDistY']) or 0.0)
    xml = xml .. string.format("      <fSeatOffsetDistZ value=\"%.4f\" />\n", tonumber(handling['fSeatOffsetDistZ']) or 0.0)
    xml = xml .. string.format("      <nMonetaryValue value=\"%d\" />\n", math.floor(tonumber(handling['nMonetaryValue']) or 50000))
    xml = xml .. string.format("      <strModelFlags>%s</strModelFlags>\n", formatPureHex(handling['strModelFlags']))
    xml = xml .. string.format("      <strHandlingFlags>%s</strHandlingFlags>\n", formatPureHex(handling['strHandlingFlags']))
    xml = xml .. string.format("      <strDamageFlags>%s</strDamageFlags>\n", formatPureHex(handling['strDamageFlags']))
    xml = xml .. "      <AIHandling>AVERAGE</AIHandling>\n"
    xml = xml .. "      <SubHandlingData>\n"
    xml = xml .. "        <Item type=\"CCarHandlingData\">\n"
    xml = xml .. string.format("          <fBackEndPopUpCarImpulseMult value=\"%.4f\" />\n", tonumber(handling['fBackEndPopUpCarImpulseMult']) or 0.0)
    xml = xml .. string.format("          <fBackEndPopUpBuildingImpulseMult value=\"%.4f\" />\n", tonumber(handling['fBackEndPopUpBuildingImpulseMult']) or 0.0)
    xml = xml .. string.format("          <fBackEndPopUpMaxDeltaSpeed value=\"%.4f\" />\n", tonumber(handling['fBackEndPopUpMaxDeltaSpeed']) or 0.0)
    xml = xml .. string.format("          <fToeFront value=\"%.4f\" />\n", tonumber(handling['fToeFront']) or 0.0)
    xml = xml .. string.format("          <fToeRear value=\"%.4f\" />\n", tonumber(handling['fToeRear']) or 0.0)
    xml = xml .. string.format("          <fCamberFront value=\"%.4f\" />\n", tonumber(handling['fCamberFront']) or 0.0)
    xml = xml .. string.format("          <fCamberRear value=\"%.4f\" />\n", tonumber(handling['fCamberRear']) or 0.0)
    xml = xml .. string.format("          <fCastor value=\"%.4f\" />\n", tonumber(handling['fCastor']) or 0.0)
    xml = xml .. string.format("          <fMaxDriveBiasTransfer value=\"%.4f\" />\n", tonumber(handling['fMaxDriveBiasTransfer']) or 0.0)
    xml = xml .. string.format("          <fJumpForceScale value=\"%.4f\" />\n", tonumber(handling['fJumpForceScale']) or 0.0)
    xml = xml .. string.format("          <fIncreasedRammingForceScale value=\"%.4f\" />\n", tonumber(handling['fIncreasedRammingForceScale']) or 0.0)
    xml = xml .. string.format("          <strAdvancedFlags>%s</strAdvancedFlags>\n", formatPureHex(handling['strAdvancedFlags']))
    xml = xml .. "        </Item>\n"
    xml = xml .. "        <Item type=\"NULL\" />\n"
    xml = xml .. "        <Item type=\"NULL\" />\n"
    xml = xml .. "      </SubHandlingData>"

    -- Send NUI message back to index.html hidden textarea routine
    SendNUIMessage({
        type = 'copy',
        text = xml
    })
    cb('ok')
end)

-- NUI Copy Complete Callback
RegisterNUICallback('copied', function(data, cb)
    if data and data.success then
        QBCore.Functions.Notify('Handling configurations copied to system clipboard!', 'success')
    else
        QBCore.Functions.Notify('Failed to write to system clipboard.', 'error')
    end
    cb('ok')
end)

-- NUI XML Import Complete Callback
RegisterNUICallback('xmlImported', function(data, cb)
    if data and data.count and data.count > 0 then
        QBCore.Functions.Notify('Successfully imported ' .. data.count .. ' handling parameters!', 'success')
    else
        QBCore.Functions.Notify('No valid handling parameters found in the XML.', 'error')
    end
    cb('ok')
end)

-- Legacy: apply attribute broadcast event
RegisterNetEvent('vehiclehandling:applyAttribute', function(netId, attribute, value)
    local vehicle = NetToVeh(netId)
    if DoesEntityExist(vehicle) then
        SetHandlingValue(vehicle, attribute, value)
        RefreshVehiclePhysics(vehicle)
    end
end)