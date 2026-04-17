import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import logoEstoque from "../assets/LogoEstoqueRaiz.png";
import {
  benefits,
  features,
  heroHighlights,
  heroLabel,
  metrics,
  spotlightItems,
  trustSignals,
  workflows,
} from "../data/landingPageData";

export const LandingPage = () => {
  const navigate = useNavigate();
  const HeroLabelIcon = heroLabel.icon;

  return (
    <div className="min-h-screen bg-[#f6f1e6] text-slate-900">
      <div className="relative overflow-hidden">
        <div className="absolute left-[-12rem] top-16 h-72 w-72 rounded-full bg-raiz-verde/10 blur-3xl" />
        <div className="absolute right-[-8rem] top-28 h-64 w-64 rounded-full bg-raiz-marrom/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-raiz-verde/40 to-transparent" />

        <header className="sticky top-0 z-50 border-b border-white/50 bg-[#f6f1e6]/90 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="rounded-[22px] border border-raiz-verde/15 bg-gradient-to-br from-white via-[#fffdf7] to-[#efe5cf] px-4 py-3 shadow-[0_18px_38px_-24px_rgba(45,90,39,0.45)] ring-1 ring-white/80">
                <img
                  src={logoEstoque}
                  alt="Estoque Raiz"
                  className="h-12 w-auto drop-shadow-[0_8px_16px_rgba(45,90,39,0.18)] sm:h-14"
                />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-raiz-verde/70">
                  Estoque Raiz
                </p>
                <p className="text-sm text-slate-600">
                  Gestao de estoque com foco operacional
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/login")}
                className="rounded-full px-5 py-2.5 text-sm font-semibold text-raiz-verde transition-colors hover:text-raiz-marrom"
              >
                Entrar
              </button>
              <button
                onClick={() => navigate("/cadastro")}
                className="rounded-full bg-raiz-verde px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-raiz-verde/20 transition-transform hover:-translate-y-0.5"
              >
                Criar conta
              </button>
            </div>
          </nav>
        </header>

        <main>
          <section className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
            <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-raiz-verde/15 bg-white/80 px-4 py-2 text-sm font-semibold text-raiz-verde shadow-sm shadow-raiz-verde/5">
                  <HeroLabelIcon size={16} />
                  <span>{heroLabel.text}</span>
                </div>

                <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-[1.05] text-raiz-verde sm:text-6xl lg:text-[4.2rem]">
                  Estoque profissional, leitura gerencial clara e rotina mais
                  leve para o time.
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                  O Estoque Raiz conecta cadastro, movimentacao, aprovacao e
                  relatorios em uma experiencia unica para web e app, com uma
                  base preparada para operar em multiplas unidades.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => navigate("/cadastro")}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-raiz-verde px-7 py-4 text-base font-semibold text-white shadow-[0_24px_50px_-28px_rgba(45,90,39,0.75)] transition-transform hover:-translate-y-0.5"
                  >
                    Comecar agora
                    <ArrowRight size={18} />
                  </button>
                  <button
                    onClick={() => navigate("/login")}
                    className="inline-flex items-center justify-center rounded-full border border-raiz-verde/20 bg-white px-7 py-4 text-base font-semibold text-raiz-verde transition-colors hover:border-raiz-verde/40 hover:bg-raiz-bege"
                  >
                    Acessar conta
                  </button>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {heroHighlights.map((highlight) => (
                    <div
                      key={highlight}
                      className="flex items-start gap-3 rounded-2xl border border-raiz-verde/10 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm shadow-raiz-verde/5"
                    >
                      <CheckCircle2
                        size={18}
                        className="mt-0.5 shrink-0 text-raiz-verde"
                      />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                  {metrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-[28px] border border-white/60 bg-white/85 p-5 shadow-[0_20px_60px_-40px_rgba(75,54,33,0.45)] backdrop-blur"
                    >
                      <p className="text-3xl font-bold text-raiz-verde">
                        {metric.value}
                      </p>
                      <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-raiz-marrom/70">
                        {metric.label}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {metric.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-[560px]">
                <div className="absolute inset-6 rounded-[36px] bg-raiz-verde/15 blur-3xl" />
                <div className="relative overflow-hidden rounded-[34px] border border-white/60 bg-white/90 p-5 shadow-[0_36px_80px_-42px_rgba(45,90,39,0.65)] backdrop-blur-xl sm:p-6">
                  <div className="rounded-[28px] bg-raiz-verde px-5 py-5 text-raiz-bege">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-raiz-bege/70">
                          Painel operacional
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          Uma visao unica do estoque
                        </p>
                      </div>
                      <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                        Web + app
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {spotlightItems.map((item) => (
                      <div
                        key={item.title}
                        className={`rounded-[24px] border border-raiz-verde/10 p-5 shadow-sm shadow-raiz-verde/5 ${item.tone}`}
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
                          {item.title}
                        </p>
                        <p className="mt-3 text-3xl font-bold">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-[28px] border border-raiz-verde/10 bg-[#f8f4ea] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-raiz-marrom/60">
                          Fluxo em destaque
                        </p>
                        <p className="mt-2 text-xl font-semibold text-raiz-verde">
                          Do cadastro ao relatorio
                        </p>
                      </div>
                      <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-raiz-verde shadow-sm">
                        Em tempo real
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      {workflows.map((item, index) => {
                        const IconComponent = item.icon;

                        return (
                          <div
                            key={item.title}
                            className="flex items-start gap-4 rounded-2xl bg-white px-4 py-4 shadow-sm shadow-raiz-verde/5"
                          >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-raiz-bege text-raiz-verde ring-1 ring-raiz-verde/10">
                              <IconComponent size={20} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-raiz-marrom/55">
                                Etapa {index + 1}
                              </p>
                              <p className="mt-1 text-base font-semibold text-raiz-verde">
                                {item.title}
                              </p>
                              <p className="mt-1 text-sm leading-6 text-slate-600">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="border-y border-raiz-verde/8 bg-white/70">
            <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-raiz-marrom/70">
                    Operacao na pratica
                  </p>
                  <h2 className="mt-4 text-4xl font-bold text-raiz-verde">
                    Mais controle sobre estoque, equipe e unidades.
                  </h2>
                  <p className="mt-4 text-lg leading-8 text-slate-600">
                    O Estoque Raiz conecta cadastros, movimentacoes, aprovacoes
                    e relatorios para reduzir ruido operacional e dar mais
                    previsibilidade a rotina.
                  </p>
                </div>
                <div className="rounded-[28px] border border-raiz-verde/10 bg-[#f8f4ea] px-5 py-4 text-sm leading-7 text-slate-600 shadow-sm shadow-raiz-verde/5 lg:max-w-md">
                  Do cadastro inicial a leitura gerencial, a plataforma mantem
                  produtos, permissoes, unidades e indicadores trabalhando em
                  uma base unica.
                </div>
              </div>

              <div className="mt-10 grid gap-5 lg:grid-cols-4">
                {features.map((feature) => {
                  const IconComponent = feature.icon;

                  return (
                    <div
                      key={feature.title}
                      className="group rounded-[30px] border border-raiz-verde/10 bg-white p-6 shadow-[0_18px_50px_-36px_rgba(45,90,39,0.7)] transition-transform duration-300 hover:-translate-y-1"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-raiz-bege text-raiz-verde ring-1 ring-raiz-verde/10">
                        <IconComponent size={24} />
                      </div>
                      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-raiz-marrom/60">
                        {feature.accent}
                      </p>
                      <h3 className="mt-3 text-xl font-semibold text-raiz-verde">
                        {feature.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[34px] bg-raiz-verde px-7 py-8 text-raiz-bege shadow-[0_34px_70px_-44px_rgba(45,90,39,0.95)]">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-raiz-bege/70">
                  Por que isso importa
                </p>
                <h2 className="mt-4 text-4xl font-bold text-white">
                  Controle confiavel sem perder agilidade na operacao.
                </h2>
                <p className="mt-5 text-base leading-8 text-raiz-bege/85">
                  A plataforma foi desenhada para mostrar o que entra, sai,
                  precisa de aprovacao e merece atencao gerencial, com clareza
                  para o time inteiro.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {benefits.map((benefit) => (
                  <div
                    key={benefit.title}
                    className="rounded-[28px] border border-raiz-verde/10 bg-white p-6 shadow-sm shadow-raiz-verde/5"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        size={20}
                        className="mt-1 shrink-0 text-raiz-verde"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-raiz-verde">
                          {benefit.title}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-[#efe7d7]">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-raiz-marrom/70">
                  Sinais de maturidade
                </p>
                <h2 className="mt-4 text-4xl font-bold text-raiz-verde">
                  O discurso comercial agora conversa com a arquitetura real do
                  projeto.
                </h2>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {trustSignals.map((signal) => (
                  <div
                    key={signal}
                    className="rounded-[24px] border border-white/70 bg-white/90 px-5 py-4 text-sm leading-7 text-slate-700 shadow-sm shadow-raiz-verde/5"
                  >
                    {signal}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-[38px] border border-raiz-verde/10 bg-white shadow-[0_34px_80px_-46px_rgba(75,54,33,0.55)]">
              <div className="grid gap-10 px-6 py-8 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:px-12 lg:py-12">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-raiz-marrom/65">
                    Pronto para operar melhor
                  </p>
                  <h2 className="mt-4 text-4xl font-bold text-raiz-verde">
                    Traga a equipe para um fluxo mais claro, rastreavel e
                    profissional.
                  </h2>
                  <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                    Crie sua conta, acesse o painel e coloque a operacao em uma
                    base mais organizada, rastreavel e preparada para crescer.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <button
                    onClick={() => navigate("/cadastro")}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-raiz-verde px-7 py-4 text-base font-semibold text-white shadow-lg shadow-raiz-verde/20 transition-transform hover:-translate-y-0.5"
                  >
                    Criar conta
                    <ArrowRight size={18} />
                  </button>
                  <button
                    onClick={() => navigate("/login")}
                    className="inline-flex items-center justify-center rounded-full border border-raiz-verde/20 bg-raiz-bege px-7 py-4 text-base font-semibold text-raiz-verde transition-colors hover:border-raiz-verde/40"
                  >
                    Entrar no sistema
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-raiz-verde/10 bg-[#17351a] text-raiz-bege">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-raiz-bege/55">
                Estoque Raiz
              </p>
              <p className="mt-4 max-w-md text-sm leading-7 text-raiz-bege/80">
                Sistema de gestao de estoque com foco em operacao multiunidade,
                aprovacao, rastreabilidade e leitura gerencial.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white">
                Cobertura
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-raiz-bege/80">
                <li>Produtos, categorias e unidades</li>
                <li>Movimentacoes e aprovacoes</li>
                <li>Dashboard, Curva ABC e estatisticas</li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white">
                Acesso rapido
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <button
                  onClick={() => navigate("/login")}
                  className="rounded-full border border-white/15 px-5 py-3 text-left text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Entrar
                </button>
                <button
                  onClick={() => navigate("/cadastro")}
                  className="rounded-full bg-white px-5 py-3 text-left text-sm font-semibold text-raiz-verde transition-transform hover:-translate-y-0.5"
                >
                  Criar conta
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 px-4 py-5 text-center text-sm text-raiz-bege/65 sm:px-6 lg:px-8">
            © 2026 Estoque Raiz. Todos os direitos reservados.
          </div>
        </footer>
      </div>
    </div>
  );
};
