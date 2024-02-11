const gconstGroups = [
  {
    'name': 'general',
    'variables': [
      'gconst_default_game_timelimit',
      'gconst_expose_timers_to_lua',
      'gconst_powerups_drop',
    ]
  },
  {
    'name': 'physics',
    'variables': [
      'gconst_player_isbullet',
      'gconst_double_jump_velocity',
      'gconst_jump_velocity',
      'gconst_playerinair_acceleration',
      'gconst_playerinair_aircontrol',
      'gconst_playerinair_bunny_accelerate',
      'gconst_playerinair_bunny_wishspeed',
      'gconst_playerinair_decceleration',
      'gconst_playerinaircrouched_acceleration',
      'gconst_playeronground_acceleration',
      'gconst_playeronground_friction',
      'gconst_playeronground_speed',
      'gconst_playerongroundcrouched_speed',
      'gconst_wallclipping',
      'gconst_world_gravity'
    ]
  },
  {
    'name': 'sound',
    'variables': [
      'gconst_armor100_faratten',
      'gconst_armor150_faratten',
      'gconst_armor50_faratten',
      'gconst_mega_faratten'
    ]
  },
  {
    'name': 'melee',
    'damage': 'gconst_melee_damage',
    'reload': 'gconst_melee_reload',
    'variables': [
      'gconst_melee_damage',
      'gconst_melee_knockmult',
      'gconst_melee_knockmult_airbourne',
      'gconst_melee_range',
      'gconst_melee_reload',
      'gconst_melee_trace_radius'
    ]
  },
  {
    'name': 'burstgun',
    'damage': 'gconst_burst_damage',
    'reload': 'gconst_burstgun_reload',
    'pellets': 'gconst_burstgun_burstsegments',
    'variables': [
      'gconst_burst_damage',
      'gconst_burst_knockmult',
      'gconst_burst_knockmult_airbourne',
      'gconst_burst_speed',
      'gconst_burstgun_ammopickupammo',
      'gconst_burstgun_burstsegments',
      'gconst_burstgun_lowammo',
      'gconst_burstgun_maxammo',
      'gconst_burstgun_reload',
      'gconst_burstgun_startammo',
      'gconst_burstgun_weaponpickupammo'
    ]
  },
  {
    'name': 'shotgun',
    'damage': 'gconst_shotgun_pellet_damage',
    'reload': 'gconst_shotgun_reload',
    'variables': [
      'gconst_shotgun_pellet_damage',
      'gconst_shotgun_pellet_knockmult',
      'gconst_shotgun_pellet_knockmult_airbourne',
      'gconst_shotgun_pellet_range',
      'gconst_shotgun_pellet_trace_radius_entities',
      'gconst_shotgun_pellet_trace_radius_world',
      'gconst_shotgun_ammopickupammo',
      'gconst_shotgun_lowammo',
      'gconst_shotgun_maxammo',
      'gconst_shotgun_reload',
      'gconst_shotgun_weaponpickupammo'
    ]
  },
  {
    'name': 'grenadelauncher',
    'damage': 'gconst_grenade_damage',
    'reload': 'gconst_grenadelauncher_reload',
    'variables': [
      'gconst_grenade_damage',
      'gconst_grenade_damage_splashmult',
      'gconst_grenade_explosion_radius',
      'gconst_grenade_gravity',
      'gconst_grenade_speed_initial',
      'gconst_grenade_trace_radius_entities',
      'gconst_grenade_trace_radius_world',
      'gconst_grenadelauncher_ammopickupammo',
      'gconst_grenadelauncher_lowammo',
      'gconst_grenadelauncher_maxammo',
      'gconst_grenadelauncher_reload',
      'gconst_grenadelauncher_weaponpickupammo'
    ]
  },
  {
    'name': 'plasmarifle',
    'damage': 'gconst_cell_damage',
    'reload': 'gconst_plasmarifle_reload',
    'variables': [
      'gconst_cell_damage',
      'gconst_cell_damage_splashmult',
      'gconst_cell_explosion_radius',
      'gconst_cell_knockmult',
      'gconst_cell_knockmult_airbourne',
      'gconst_cell_knockmult_self',
      'gconst_cell_speed',
      'gconst_cell_trace_radius_entities',
      'gconst_cell_trace_radius_world',
      'gconst_plasmarifle_ammopickupammo',
      'gconst_plasmarifle_lowammo',
      'gconst_plasmarifle_maxammo',
      'gconst_plasmarifle_reload',
      'gconst_plasmarifle_weaponpickupammo'
    ]
  },
  {
    'name': 'rocketlauncher',
    'damage': 'gconst_rocket_damage',
    'reload': 'gconst_rocketlauncher_reload',
    'variables': [
      'gconst_rocket_damage',
      'gconst_rocket_damage_splashmult',
      'gconst_rocket_explosion_radius',
      'gconst_rocket_knockmult',
      'gconst_rocket_knockmult_airbourne',
      'gconst_rocket_knockmult_self',
      'gconst_rocket_speed',
      'gconst_rocket_trace_radius_entities',
      'gconst_rocket_trace_radius_world',
      'gconst_rocketlauncher_ammopickupammo',
      'gconst_rocketlauncher_lowammo',
      'gconst_rocketlauncher_maxammo',
      'gconst_rocketlauncher_reload',
      'gconst_rocketlauncher_weaponpickupammo'
    ]
  },
  {
    'name': 'ioncannon',
    'damage': 'gconst_beam_damage',
    'reload': 'gconst_ioncannon_reload',
    'variables': [
      'gconst_beam_damage',
      'gconst_beam_distance',
      'gconst_beam_knockmult',
      'gconst_beam_knockmult_airbourne',
      'gconst_beam_trace_radius_entities',
      'gconst_beam_trace_radius_world',
      'gconst_ioncannon_ammopickupammo',
      'gconst_ioncannon_hum',
      'gconst_ioncannon_hum_faratten',
      'gconst_ioncannon_lowammo',
      'gconst_ioncannon_maxammo',
      'gconst_ioncannon_reload',
      'gconst_ioncannon_weaponpickupammo'
    ]
  },
  {
    'name': 'boltrifle',
    'damage': 'gconst_bolt_damage',
    'reload': 'gconst_boltrifle_reload',
    'variables': [
      'gconst_bolt_damage',
      'gconst_bolt_knockmult',
      'gconst_bolt_knockmult_airbourne',
      'gconst_bolt_range',
      'gconst_bolt_trace_radius_entities',
      'gconst_bolt_trace_radius_world',
      'gconst_boltrifle_ammopickupammo',
      'gconst_boltrifle_hum',
      'gconst_boltrifle_hum_faratten',
      'gconst_boltrifle_lowammo',
      'gconst_boltrifle_maxammo',
      'gconst_boltrifle_reload',
      'gconst_boltrifle_weaponpickupammo'
    ]
  },
  {
    'name': 'stake',
    'damage': 'gconst_stake_damage',
    'reload': 'gconst_stakelauncher_reload',
    'variables': [
      'gconst_stake_damage',
      'gconst_stake_gravity',
      'gconst_stake_knockmult',
      'gconst_stake_knockmult_airbourne',
      'gconst_stake_radius',
      'gconst_stake_speed',
      'gconst_stake_trace_radius',
      'gconst_stakelauncher_ammopickupammo',
      'gconst_stakelauncher_enabled',
      'gconst_stakelauncher_lowammo',
      'gconst_stakelauncher_maxammo',
      'gconst_stakelauncher_reload',
      'gconst_stakelauncher_weaponpickupammo'
    ]
  }
];