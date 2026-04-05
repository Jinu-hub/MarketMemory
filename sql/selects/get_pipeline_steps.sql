SELECT 
  ps.pipeline_key,
  ps.step,
  ps.target_type,
  ps.target_key,
  CASE 
    WHEN ps.target_type = 'pipeline' THEN pp.name 
    ELSE pt.name 
  END AS name,
  pr.active_prompt_id,
  pt.version,
  pt.template,
  pt.default_provider,
  pt.default_model,
  pt.default_params,
  pt.temperature,
  pt.api_mode
FROM pipeline_steps AS ps
LEFT JOIN pipelines AS pp
  ON ps.target_key = pp.pipeline_key 
  AND ps.target_type = 'pipeline'
LEFT JOIN prompt_releases AS pr
  ON ps.target_key = pr.agent_key
  AND ps.target_type = 'agent'
LEFT JOIN prompt_templates AS pt
  ON pr.active_prompt_id = pt.id 
  AND pt.status = 'active'
WHERE ps.pipeline_key = 'p1-core'
ORDER BY ps.step;