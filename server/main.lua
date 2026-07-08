local QBCore = exports['qb-core']:GetCoreObject()

-- Create/Migrate the database table on script startup
local function MigrateDatabaseTable()
    -- First, ensure the base table exists with the model PRIMARY KEY
    local query = [[
        CREATE TABLE IF NOT EXISTS `vehicle_model_handling` (
            `model` VARCHAR(50) NOT NULL PRIMARY KEY
        )
    ]]
    exports['oxmysql']:execute(query, {}, function(affectedRows)
        -- Now, fetch the existing columns to check for any missing ones
        exports['oxmysql']:execute("SHOW COLUMNS FROM `vehicle_model_handling`", {}, function(columns)
            if columns then
                local existingColumns = {}
                for _, col in ipairs(columns) do
                    existingColumns[col.Field] = true
                end
                
                -- Complete list of all columns and their types
                local columnDefinitions = {
                    fMass = "FLOAT",
                    fInitialDragCoeff = "FLOAT",
                    fDownforceModifier = "FLOAT",
                    fPercentSubmerged = "FLOAT",
                    vecCentreOfMassOffset_x = "FLOAT",
                    vecCentreOfMassOffset_y = "FLOAT",
                    vecCentreOfMassOffset_z = "FLOAT",
                    vecInertiaMultiplier_x = "FLOAT",
                    vecInertiaMultiplier_y = "FLOAT",
                    vecInertiaMultiplier_z = "FLOAT",
                    fDriveBiasFront = "FLOAT",
                    nInitialDriveGears = "INT",
                    fInitialDriveForce = "FLOAT",
                    fDriveInertia = "FLOAT",
                    fClutchChangeRateScaleUpShift = "FLOAT",
                    fClutchChangeRateScaleDownShift = "FLOAT",
                    fInitialDriveMaxFlatVel = "FLOAT",
                    fBrakeForce = "FLOAT",
                    fBrakeBiasFront = "FLOAT",
                    fHandBrakeForce = "FLOAT",
                    fSteeringLock = "FLOAT",
                    fTractionCurveMax = "FLOAT",
                    fTractionCurveMin = "FLOAT",
                    fTractionCurveLateral = "FLOAT",
                    fTractionSpringDeltaMax = "FLOAT",
                    fLowSpeedTractionLossMult = "FLOAT",
                    fCamberStiffnesss = "FLOAT",
                    fTractionBiasFront = "FLOAT",
                    fTractionLossMult = "FLOAT",
                    fSuspensionForce = "FLOAT",
                    fSuspensionCompDamp = "FLOAT",
                    fSuspensionReboundDamp = "FLOAT",
                    fSuspensionUpperLimit = "FLOAT",
                    fSuspensionLowerLimit = "FLOAT",
                    fSuspensionRaise = "FLOAT",
                    fSuspensionBiasFront = "FLOAT",
                    fAntiRollBarForce = "FLOAT",
                    fAntiRollBarBiasFront = "FLOAT",
                    fRollCentreHeightFront = "FLOAT",
                    fRollCentreHeightRear = "FLOAT",
                    fCollisionDamageMult = "FLOAT",
                    fWeaponDamageMult = "FLOAT",
                    fDeformationDamageMult = "FLOAT",
                    fEngineDamageMult = "FLOAT",
                    fPetrolTankVolume = "FLOAT",
                    fPetrolConsumptionRate = "FLOAT",
                    fOilVolume = "FLOAT",
                    fSeatOffsetDistX = "FLOAT",
                    fSeatOffsetDistY = "FLOAT",
                    fSeatOffsetDistZ = "FLOAT",
                    nMonetaryValue = "INT",
                    strModelFlags = "INT UNSIGNED",
                    strHandlingFlags = "INT UNSIGNED",
                    strDamageFlags = "INT UNSIGNED",
                    
                    -- CCarHandlingData (SubHandlingData)
                    fBackEndPopUpCarImpulseMult = "FLOAT",
                    fBackEndPopUpBuildingImpulseMult = "FLOAT",
                    fBackEndPopUpMaxDeltaSpeed = "FLOAT",
                    fToeFront = "FLOAT",
                    fToeRear = "FLOAT",
                    fCamberFront = "FLOAT",
                    fCamberRear = "FLOAT",
                    fCastor = "FLOAT",
                    fMaxDriveBiasTransfer = "FLOAT",
                    fJumpForceScale = "FLOAT",
                    fIncreasedRammingForceScale = "FLOAT",
                    strAdvancedFlags = "INT UNSIGNED"
                }
                
                -- Check for missing columns and run ALTER TABLE dynamically
                for colName, colType in pairs(columnDefinitions) do
                    if not existingColumns[colName] then
                        local alterQuery = string.format("ALTER TABLE `vehicle_model_handling` ADD COLUMN `%s` %s", colName, colType)
                        exports['oxmysql']:execute(alterQuery, {}, function(res)
                            print(string.format("[qb-vehicle-handling-editor] Added missing column `%s` (%s) to `vehicle_model_handling` table.", colName, colType))
                        end)
                    end
                end
            else
                print("[qb-vehicle-handling-editor] Warning: Failed to inspect database columns.")
            end
        end)
    end)
end

MigrateDatabaseTable()

-- Single attribute setter (No permission restrictions)
RegisterNetEvent('vehiclehandling:setAttribute', function(netId, attribute, value)
    local source = source
    local isValid = false
    for _, attr in ipairs(Config.ValidAttributes) do
        if attr == attribute then
            isValid = true
            break
        end
    end

    if not isValid then
        TriggerClientEvent('QBCore:Notify', source, 'Invalid attribute.', 'error')
        return
    end

    TriggerClientEvent('vehiclehandling:applyAttribute', -1, netId, attribute, value) -- Broadcast to all clients!
end)

-- Fetch model-wide custom handling parameters
RegisterNetEvent('vehiclehandling:fetchModelTuning', function(modelName)
    local src = source
    local query = "SELECT * FROM `vehicle_model_handling` WHERE `model` = ?"
    
    exports['oxmysql']:execute(query, { modelName }, function(result)
        if result and #result > 0 then
            TriggerClientEvent('vehiclehandling:loadModelTuning', src, modelName, result[1])
        else
            TriggerClientEvent('vehiclehandling:loadModelTuning', src, modelName, nil)
        end
    end)
end)

-- Save model-wide custom handling parameters (No permission restrictions)
RegisterNetEvent('vehiclehandling:saveModelTuning', function(modelName, data)
    local src = source

    -- Dynamically prepare query and parameters based on Config.ValidAttributes
    local columns = { "`model`" }
    local valuePlaceholders = { "?" }
    local updateClauses = {}
    local params = { modelName }

    for _, attr in ipairs(Config.ValidAttributes) do
        if data[attr] ~= nil then
            table.insert(columns, string.format("`%s`", attr))
            table.insert(valuePlaceholders, "?")
            table.insert(updateClauses, string.format("`%s` = VALUES(`%s`)", attr, attr))
            table.insert(params, tonumber(data[attr]))
        end
    end

    local query = string.format(
        "INSERT INTO `vehicle_model_handling` (%s) VALUES (%s) ON DUPLICATE KEY UPDATE %s",
        table.concat(columns, ", "),
        table.concat(valuePlaceholders, ", "),
        table.concat(updateClauses, ", ")
    )

    exports['oxmysql']:execute(query, params, function(affectedRows)
        if affectedRows then
            TriggerClientEvent('QBCore:Notify', src, 'Model handling profile saved successfully!', 'success')
            -- Broadcast reload command to all active drivers of this model
            TriggerClientEvent('vehiclehandling:refreshModelDrivers', -1, modelName)
        else
            TriggerClientEvent('QBCore:Notify', src, 'Failed to save handling profile.', 'error')
        end
    end)
end)

-- Reset model handling to stock (removes DB profile) (No permission restrictions)
RegisterNetEvent('vehiclehandling:deleteModelTuning', function(modelName)
    local src = source

    local query = "DELETE FROM `vehicle_model_handling` WHERE `model` = ?"
    exports['oxmysql']:execute(query, { modelName }, function(affectedRows)
        if affectedRows then
            TriggerClientEvent('QBCore:Notify', src, 'Model handling profile reset to default.', 'success')
            -- Broadcast refresh/reload to defaults
            TriggerClientEvent('vehiclehandling:refreshModelDrivers', -1, modelName)
        end
    end)
end)

-- Register QBCore Commands for everyone ('user' group)
QBCore.Commands.Add('tunehandling', 'Open vehicle handling editor', {}, false, function(source)
    local src = source
    TriggerClientEvent('vehiclehandling:client:openEditor', src)
end, 'user')

QBCore.Commands.Add('sethandling', 'Set vehicle handling attribute', {
    { name = 'attribute', help = 'Handling attribute name' },
    { name = 'value', help = 'Numeric value' }
}, true, function(source, args)
    local src = source
    local attribute = args[1]
    local value = tonumber(args[2])
    TriggerClientEvent('vehiclehandling:client:setHandling', src, attribute, value)
end, 'user')