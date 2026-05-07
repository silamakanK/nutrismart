import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

// Métriques custom
const errorRate = new Rate("errors");
const pageResponseTime = new Trend("page_response_time", true);

// URL cible — modifier selon l'environnement
const BASE_URL = __ENV.BASE_URL || "http://nutrismart.local:9080";

// Scénario de montée en charge progressif (hypothèses doc architecture)
// Phase 1 : montée de 0 → 10 VU en 1 min  (charge nominale)
// Phase 2 : plateau 10 VU pendant 2 min
// Phase 3 : montée de 10 → 50 VU en 2 min  (charge de pic)
// Phase 4 : plateau 50 VU pendant 2 min
// Phase 5 : descente de 50 → 0 VU en 1 min
export const options = {
  stages: [
    { duration: "1m", target: 10 },
    { duration: "2m", target: 10 },
    { duration: "2m", target: 50 },
    { duration: "2m", target: 50 },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    // Seuils issus du document d'architecture (section 2.2)
    http_req_duration: ["p(95)<800"],   // 800 ms max au pic
    http_req_failed: ["rate<0.05"],     // < 5 % d'erreurs
    errors: ["rate<0.05"],
  },
};

export default function () {
  // Scénario 1 : page d'accueil
  let res = http.get(`${BASE_URL}/`, {
    tags: { page: "home" },
  });
  pageResponseTime.add(res.timings.duration, { page: "home" });
  check(res, {
    "home — status 200": (r) => r.status === 200,
    "home — réponse < 300 ms": (r) => r.timings.duration < 300,
  }) || errorRate.add(1);

  sleep(1);

  // Scénario 2 : page de connexion
  res = http.get(`${BASE_URL}/connexion`, {
    tags: { page: "connexion" },
  });
  pageResponseTime.add(res.timings.duration, { page: "connexion" });
  check(res, {
    "connexion — status 200": (r) => r.status === 200,
    "connexion — réponse < 300 ms": (r) => r.timings.duration < 300,
  }) || errorRate.add(1);

  sleep(1);

  // Scénario 3 : page recettes (lecture BDD — charge élevée selon hypothèses)
  res = http.get(`${BASE_URL}/recettes`, {
    tags: { page: "recettes" },
  });
  pageResponseTime.add(res.timings.duration, { page: "recettes" });
  check(res, {
    "recettes — status 200 ou 302": (r) =>
      r.status === 200 || r.status === 302 || r.status === 307,
    "recettes — réponse < 800 ms": (r) => r.timings.duration < 800,
  }) || errorRate.add(1);

  sleep(2);

  // Scénario 4 : page recherche
  res = http.get(`${BASE_URL}/recherche`, {
    tags: { page: "recherche" },
  });
  pageResponseTime.add(res.timings.duration, { page: "recherche" });
  check(res, {
    "recherche — status 200 ou 302": (r) =>
      r.status === 200 || r.status === 302 || r.status === 307,
  }) || errorRate.add(1);

  sleep(1);
}

export function handleSummary(data) {
  return {
    "k6/results-summary.json": JSON.stringify(data, null, 2),
  };
}
