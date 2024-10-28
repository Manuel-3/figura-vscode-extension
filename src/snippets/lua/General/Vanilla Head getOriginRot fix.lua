--! vanilla_model.HEAD:getOriginRot() bug fix
--? vanilla_model.HEAD:getOriginRot() sometimes gets stuck when looking around too quickly.
--? This fixes that issue by limiting the values to the regular interval.
((vanilla_model.HEAD:getOriginRot()+180)%360-180)