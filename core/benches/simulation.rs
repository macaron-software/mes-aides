use criterion::{black_box, criterion_group, criterion_main, Criterion};
use aides_core::engine::{Simulator, Situation, Logement, LogementType, ZoneAPL, CompositionFamiliale};

fn situation_simple() -> Situation {
    Situation {
        age: 35,
        revenus_mensuels: 800.0,
        composition_familiale: CompositionFamiliale::Seul,
        nombre_enfants: 0,
        ages_enfants: vec![],
        logement: Some(Logement {
            type_logement: LogementType::Locataire,
            loyer_mensuel: Some(500.0),
            zone_apl: Some(ZoneAPL::Zone2),
            surface_m2: None,
            meuble: false,
        }),
        handicap_taux: None,
        demandeur_emploi: false,
        etudiant: false,
        retraite: false,
        departement: Some("75".to_string()),
        ressortissant_ue: true,
        residence_france_5ans: true,
    }
}

fn situation_complex() -> Situation {
    Situation {
        age: 45,
        revenus_mensuels: 1200.0,
        composition_familiale: CompositionFamiliale::Couple,
        nombre_enfants: 3,
        ages_enfants: vec![5, 10, 15],
        logement: Some(Logement {
            type_logement: LogementType::Locataire,
            loyer_mensuel: Some(900.0),
            zone_apl: Some(ZoneAPL::Zone1),
            surface_m2: Some(80.0),
            meuble: false,
        }),
        handicap_taux: Some(60),
        demandeur_emploi: true,
        etudiant: false,
        retraite: false,
        departement: Some("69".to_string()),
        ressortissant_ue: true,
        residence_france_5ans: true,
    }
}

fn bench_simulation_simple(c: &mut Criterion) {
    let sim = Simulator::new();
    let sit = situation_simple();
    
    c.bench_function("simulate_simple", |b| {
        b.iter(|| {
            sim.simulate(black_box(&sit))
        })
    });
}

fn bench_simulation_complex(c: &mut Criterion) {
    let sim = Simulator::new();
    let sit = situation_complex();
    
    c.bench_function("simulate_complex", |b| {
        b.iter(|| {
            sim.simulate(black_box(&sit))
        })
    });
}

fn bench_simulator_creation(c: &mut Criterion) {
    c.bench_function("simulator_new", |b| {
        b.iter(|| {
            black_box(Simulator::new())
        })
    });
}

fn bench_batch_simulations(c: &mut Criterion) {
    let sim = Simulator::new();
    let situations: Vec<Situation> = (0..100)
        .map(|i| Situation {
            age: 20 + (i % 60) as u8,
            revenus_mensuels: (i as f64) * 50.0,
            composition_familiale: if i % 2 == 0 { CompositionFamiliale::Seul } else { CompositionFamiliale::Couple },
            nombre_enfants: (i % 4) as u8,
            ages_enfants: (0..(i % 4)).map(|j| (j * 5) as u8).collect(),
            logement: Some(Logement {
                type_logement: LogementType::Locataire,
                loyer_mensuel: Some(400.0 + (i as f64) * 5.0),
                zone_apl: Some(ZoneAPL::Zone2),
                surface_m2: None,
                meuble: false,
            }),
            handicap_taux: if i % 10 == 0 { Some(80) } else { None },
            demandeur_emploi: i % 5 == 0,
            etudiant: i % 20 == 0,
            retraite: i > 80,
            departement: Some("75".to_string()),
            ressortissant_ue: true,
            residence_france_5ans: true,
        })
        .collect();
    
    c.bench_function("simulate_batch_100", |b| {
        b.iter(|| {
            for sit in &situations {
                black_box(sim.simulate(sit));
            }
        })
    });
}

criterion_group!(
    benches,
    bench_simulation_simple,
    bench_simulation_complex,
    bench_simulator_creation,
    bench_batch_simulations,
);
criterion_main!(benches);
