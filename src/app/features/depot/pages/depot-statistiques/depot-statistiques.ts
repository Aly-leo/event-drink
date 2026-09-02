import { Component, signal, computed, viewChild, ElementRef, effect, afterNextRender, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface VenteProduit {
  nom: string;
  quantiteVendue: number;
  chiffreAffaires: number;
}

interface DonneesPeriode {
  kpis: {
    chiffreAffairesTotal: number;
    commandesTotal: number;
    panierMoyen: number;
    croissance: number;
  };
  evolution: { labels: string[]; valeurs: number[] };
  repartitionCategories: { labels: string[]; valeurs: number[] };
  topProduits: VenteProduit[];
}

@Component({
  selector: 'app-depot-statistiques',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './depot-statistiques.html',
  styleUrl: './depot-statistiques.scss',
})
export class DepotStatistiques {
  private graphiqueEvolutionRef = viewChild.required<ElementRef<HTMLCanvasElement>>('graphiqueEvolution');
  private graphiqueTopProduitsRef = viewChild.required<ElementRef<HTMLCanvasElement>>('graphiqueTopProduits');
  private graphiqueCategoriesRef = viewChild.required<ElementRef<HTMLCanvasElement>>('graphiqueCategories');

  private chartEvolution?: Chart;
  private chartTopProduits?: Chart;
  private chartCategories?: Chart;

  periodesDisponibles: string[] = ['7 derniers jours', '30 derniers jours', '3 derniers mois'];
  periodeSelectionnee = signal('30 derniers jours');

  // --- Mock Data dynamique par période ---
  private baseDonneesParPeriode: Record<string, DonneesPeriode> = {
    '7 derniers jours': {
      kpis: { chiffreAffairesTotal: 253000, commandesTotal: 18, panierMoyen: 14055, croissance: 8.2 },
      evolution: { labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'], valeurs: [22000, 18000, 31000, 27000, 45000, 62000, 38000] },
      repartitionCategories: { labels: ['Bière locale', 'Vin', 'Soft', 'Spiritueux'], valeurs: [50, 15, 25, 10] },
      topProduits: [
        { nom: '33 Export', quantiteVendue: 45, chiffreAffaires: 54000 },
        { nom: 'Castel Beer 65cl', quantiteVendue: 38, chiffreAffaires: 57000 },
        { nom: 'Coca-Cola 25cl', quantiteVendue: 30, chiffreAffaires: 28500 },
        { nom: 'Mützig', quantiteVendue: 22, chiffreAffaires: 35200 },
        { nom: 'Guinness Foreign Extra', quantiteVendue: 12, chiffreAffaires: 129600 },
      ]
    },
    '30 derniers jours': {
      kpis: { chiffreAffairesTotal: 780000, commandesTotal: 50, panierMoyen: 15600, croissance: 12.5 },
      evolution: { labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'], valeurs: [165000, 190000, 175000, 250000] },
      repartitionCategories: { labels: ['Bière locale', 'Vin', 'Soft', 'Spiritueux'], valeurs: [45, 20, 25, 10] },
      topProduits: [
        { nom: 'Castel Beer 65cl', quantiteVendue: 145, chiffreAffaires: 217500 },
        { nom: '33 Export', quantiteVendue: 120, chiffreAffaires: 144000 },
        { nom: 'Mützig', quantiteVendue: 98, chiffreAffaires: 156800 },
        { nom: 'Coca-Cola 25cl', quantiteVendue: 87, chiffreAffaires: 82650 },
        { nom: 'Guinness Foreign Extra', quantiteVendue: 54, chiffreAffaires: 583200 },
      ]
    },
    '3 derniers mois': {
      kpis: { chiffreAffairesTotal: 2105000, commandesTotal: 135, panierMoyen: 15592, croissance: 15.1 },
      evolution: { labels: ['Juin', 'Juillet', 'Août'], valeurs: [620000, 705000, 780000] },
      repartitionCategories: { labels: ['Bière locale', 'Vin', 'Soft', 'Spiritueux'], valeurs: [40, 25, 20, 15] },
      topProduits: [
        { nom: 'Castel Beer 65cl', quantiteVendue: 410, chiffreAffaires: 615000 },
        { nom: 'Mützig', quantiteVendue: 320, chiffreAffaires: 512000 },
        { nom: '33 Export', quantiteVendue: 310, chiffreAffaires: 372000 },
        { nom: 'Guinness Foreign Extra', quantiteVendue: 180, chiffreAffaires: 1944000 },
        { nom: 'Coca-Cola 25cl', quantiteVendue: 160, chiffreAffaires: 152000 },
      ]
    }
  };

  // --- Computed signals réactifs aux changements de période ---
  donneesCourantes = computed(() => this.baseDonneesParPeriode[this.periodeSelectionnee()]);
  kpis = computed(() => this.donneesCourantes().kpis);
  topProduits = computed(() => this.donneesCourantes().topProduits);
  produitLePlusVendu = computed(() => 
    this.topProduits().reduce((max, p) => p.quantiteVendue > max.quantiteVendue ? p : max, this.topProduits()[0])
  );

  constructor() {
    afterNextRender(() => {
      this.creerGraphiques();
    });

    // Met à jour les 3 graphiques lorsque la période change
    effect(() => {
      this.periodeSelectionnee();
      if (this.chartEvolution && this.chartTopProduits && this.chartCategories) {
        this.mettreAJourTousLesGraphiques();
      }
    });

    inject(DestroyRef).onDestroy(() => {
      this.chartEvolution?.destroy();
      this.chartTopProduits?.destroy();
      this.chartCategories?.destroy();
    });
  }

  selectionnerPeriode(periode: string) {
    this.periodeSelectionnee.set(periode);
  }

  private creerGraphiques() {
    this.creerGraphiqueEvolution();
    this.creerGraphiqueTopProduits();
    this.creerGraphiqueCategories();
  }

  private mettreAJourTousLesGraphiques() {
    const data = this.donneesCourantes();

    // 1. Évolution CA
    this.chartEvolution!.data.labels = data.evolution.labels;
    this.chartEvolution!.data.datasets[0].data = data.evolution.valeurs;
    this.chartEvolution!.update();

    // 2. Top Produits
    const produits = [...data.topProduits].sort((a, b) => b.quantiteVendue - a.quantiteVendue);
    this.chartTopProduits!.data.labels = produits.map(p => p.nom);
    this.chartTopProduits!.data.datasets[0].data = produits.map(p => p.quantiteVendue);
    this.chartTopProduits!.update();

    // 3. Catégories
    this.chartCategories!.data.labels = data.repartitionCategories.labels;
    this.chartCategories!.data.datasets[0].data = data.repartitionCategories.valeurs;
    this.chartCategories!.update();
  }

  private creerGraphiqueEvolution() {
    const data = this.donneesCourantes().evolution;
    this.chartEvolution = new Chart(this.graphiqueEvolutionRef().nativeElement, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Chiffre d\'affaires (FCFA)',
          data: data.valeurs,
          borderColor: '#a33900',
          backgroundColor: 'rgba(163, 57, 0, 0.1)',
          fill: true,
          tension: 0.3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { callback: (v) => `${Number(v) / 1000}k` } } },
      },
    });
  }

  private creerGraphiqueTopProduits() {
    const produits = [...this.donneesCourantes().topProduits].sort((a, b) => b.quantiteVendue - a.quantiteVendue);
    this.chartTopProduits = new Chart(this.graphiqueTopProduitsRef().nativeElement, {
      type: 'bar',
      data: {
        labels: produits.map(p => p.nom),
        datasets: [{
          label: 'Quantité vendue',
          data: produits.map(p => p.quantiteVendue),
          backgroundColor: '#a33900',
          borderRadius: 6,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
    });
  }

  private creerGraphiqueCategories() {
    const data = this.donneesCourantes().repartitionCategories;
    this.chartCategories = new Chart(this.graphiqueCategoriesRef().nativeElement, {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.valeurs,
          backgroundColor: ['#a33900', '#cc4900', '#f59e0b', '#545f73'],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } },
      },
    });
  }
}