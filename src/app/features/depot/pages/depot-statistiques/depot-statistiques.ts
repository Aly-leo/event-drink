import { Component, signal, computed, viewChild, ElementRef, effect, afterNextRender, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { DepotsService, StatistiquesDepot } from '../../../../core/services/depots.service';
import { CategorieProduit } from '../../../../core/models/produit.model';

Chart.register(...registerables);

interface OptionPeriode {
  label: string;
  jours: 7 | 30 | 90;
}

@Component({
  selector: 'app-depot-statistiques',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './depot-statistiques.html',
  styleUrl: './depot-statistiques.scss',
})
export class DepotStatistiques {
  private readonly depotsService = inject(DepotsService);

  private graphiqueEvolutionRef = viewChild<ElementRef<HTMLCanvasElement>>('graphiqueEvolution');
  private graphiqueTopProduitsRef = viewChild<ElementRef<HTMLCanvasElement>>('graphiqueTopProduits');
  private graphiqueCategoriesRef = viewChild<ElementRef<HTMLCanvasElement>>('graphiqueCategories');

  private chartEvolution?: Chart;
  private chartTopProduits?: Chart;
  private chartCategories?: Chart;

  readonly categorieLabels: Record<CategorieProduit, string> = {
    [CategorieProduit.BIERE_LOCALE]: 'Bière locale',
    [CategorieProduit.BIERE_IMPORTEE]: 'Bière importée',
    [CategorieProduit.CHAMPAGNE_EFFERVESCENT]: 'Champagne / effervescent',
    [CategorieProduit.VIN]: 'Vin',
    [CategorieProduit.SANS_ALCOOL]: 'Sans alcool',
  };

  periodesDisponibles: OptionPeriode[] = [
    { label: '7 derniers jours', jours: 7 },
    { label: '30 derniers jours', jours: 30 },
    { label: '3 derniers mois', jours: 90 },
  ];
  periodeSelectionnee = signal<OptionPeriode>(this.periodesDisponibles[1]);

  loading = signal(true);
  error = signal<string | null>(null);
  donneesCourantes = signal<StatistiquesDepot | null>(null);

  kpis = computed(() => this.donneesCourantes()?.kpis ?? { chiffreAffairesTotal: 0, commandesTotal: 0, panierMoyen: 0, croissance: 0 });
  topProduits = computed(() => this.donneesCourantes()?.topProduits ?? []);
  produitLePlusVendu = computed(() =>
    this.topProduits().length > 0
      ? this.topProduits().reduce((max, p) => (p.quantiteVendue > max.quantiteVendue ? p : max), this.topProduits()[0])
      : null
  );

  constructor() {
    afterNextRender(() => {
      this.load();
    });

    effect(() => {
      const data = this.donneesCourantes();
      const evoRef = this.graphiqueEvolutionRef();
      const topRef = this.graphiqueTopProduitsRef();
      const catRef = this.graphiqueCategoriesRef();
      if (!data || !evoRef || !topRef || !catRef) return;

      if (this.chartEvolution && this.chartTopProduits && this.chartCategories) {
        this.mettreAJourTousLesGraphiques(data);
      } else {
        this.creerGraphiques(data, evoRef, topRef, catRef);
      }
    });

    inject(DestroyRef).onDestroy(() => {
      this.chartEvolution?.destroy();
      this.chartTopProduits?.destroy();
      this.chartCategories?.destroy();
    });
  }

  selectionnerPeriode(periode: OptionPeriode) {
    this.periodeSelectionnee.set(periode);
    this.load();
  }

  labelCategorie(cat: CategorieProduit): string {
    return this.categorieLabels[cat] ?? cat;
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.depotsService.getMesStatistiques(this.periodeSelectionnee().jours).subscribe({
      next: (data) => {
        this.donneesCourantes.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les statistiques.');
        this.loading.set(false);
      },
    });
  }

  private creerGraphiques(
    data: StatistiquesDepot,
    evoRef: ElementRef<HTMLCanvasElement>,
    topRef: ElementRef<HTMLCanvasElement>,
    catRef: ElementRef<HTMLCanvasElement>
  ) {
    this.creerGraphiqueEvolution(data, evoRef);
    this.creerGraphiqueTopProduits(data, topRef);
    this.creerGraphiqueCategories(data, catRef);
  }

  private mettreAJourTousLesGraphiques(data: StatistiquesDepot) {
    this.chartEvolution!.data.labels = data.evolution.labels;
    this.chartEvolution!.data.datasets[0].data = data.evolution.valeurs;
    this.chartEvolution!.update();

    const produits = [...data.topProduits].sort((a, b) => b.quantiteVendue - a.quantiteVendue);
    this.chartTopProduits!.data.labels = produits.map((p) => p.nom);
    this.chartTopProduits!.data.datasets[0].data = produits.map((p) => p.quantiteVendue);
    this.chartTopProduits!.update();

    this.chartCategories!.data.labels = data.repartitionCategories.labels.map((c) => this.labelCategorie(c));
    this.chartCategories!.data.datasets[0].data = data.repartitionCategories.valeurs;
    this.chartCategories!.update();
  }

  private creerGraphiqueEvolution(data: StatistiquesDepot, ref: ElementRef<HTMLCanvasElement>) {
    this.chartEvolution = new Chart(ref.nativeElement, {
      type: 'line',
      data: {
        labels: data.evolution.labels,
        datasets: [{
          label: 'Chiffre d\'affaires (FCFA)',
          data: data.evolution.valeurs,
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

  private creerGraphiqueTopProduits(data: StatistiquesDepot, ref: ElementRef<HTMLCanvasElement>) {
    const produits = [...data.topProduits].sort((a, b) => b.quantiteVendue - a.quantiteVendue);
    this.chartTopProduits = new Chart(ref.nativeElement, {
      type: 'bar',
      data: {
        labels: produits.map((p) => p.nom),
        datasets: [{
          label: 'Quantité vendue',
          data: produits.map((p) => p.quantiteVendue),
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

  private creerGraphiqueCategories(data: StatistiquesDepot, ref: ElementRef<HTMLCanvasElement>) {
    this.chartCategories = new Chart(ref.nativeElement, {
      type: 'doughnut',
      data: {
        labels: data.repartitionCategories.labels.map((c) => this.labelCategorie(c)),
        datasets: [{
          data: data.repartitionCategories.valeurs,
          backgroundColor: ['#a33900', '#cc4900', '#f59e0b', '#545f73', '#10b981'],
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
