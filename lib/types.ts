export type ProductPick = {
  brand: string;
  name: string;
  reason?: string;
  query?: string;
};

export type DiyRecipe = {
  name: string;
  ingredients: string[];
  instructions: string[];
  safety_note?: string;
};

export type GlowReport = {
  client_name?: string;
  archetype_summary: {
    type: string;
    vibe: string;
    key_advantages: string[];
    key_limiters: string[];
    diagnostic_notes: string[];
  };
  celebrity_matches: {
    name: string;
    reason: string;
    style_reference_query: string;
  }[];
  hair_plan: {
    cut: { fade: string; guards: string; top_length_inches: string; notes: string; barber_script: string; };
    styling: { steps: string[]; finish: string; };
    products: { budget: ProductPick[]; mid: ProductPick[]; premium: ProductPick[]; };
    diy: DiyRecipe;
    image_queries: string[];
  };
  beard_plan: {
    length_mm: string;
    shape: string;
    neckline: string;
    maintenance: string[];
    products: { budget: ProductPick[]; premium: ProductPick[]; };
    diy: DiyRecipe;
    image_queries: string[];
  };
  skin_plan: {
    skin_type: string;
    routine: { daily: string[]; weekly: string[]; };
    products: { budget: ProductPick[]; mid: ProductPick[]; premium: ProductPick[]; };
    diy: DiyRecipe[];
  };
  style_system: {
    body_structure_assumption: string;
    fit_rules: string[];
    color_palette: string[];
    core_items: string[];
    outfits: { casual: string[]; dating: string[]; professional: string[]; };
    brands: { budget: string[]; mid: string[]; premium: string[]; };
    image_queries: string[];
  };
  behavioral_optimization: {
    expressions: string[];
    posture: string[];
    presence: string[];
  };
  top_3_transformations: string[];
  execution_plan: { daily: string[]; weekly: string[]; monthly: string[]; };
  visual_reference_queries: string[];
};
