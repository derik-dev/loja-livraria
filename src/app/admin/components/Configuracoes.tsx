'use client'

import { useState } from 'react'

export default function Configuracoes() {
  const [loja, setLoja] = useState({ nome: 'Papelada', email: 'contato@papelada.com.br', telefone: '(11) 99999-0000', cnpj: '', descricao: 'Livraria independente de papel, tinta e opinião.' })
  const [senha, setSenha] = useState({ atual: '', nova: '', confirmar: '' })
  const [saved, setSaved] = useState(false)

  function handleSaveLoja(e: React.FormEvent) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-black text-zinc-900 uppercase tracking-wide">Configurações</h1>
        <p className="text-sm text-zinc-400 mt-0.5">Gerencie as informações da sua loja</p>
      </div>

      {/* Informações da loja */}
      <div className="bg-white border border-zinc-200 rounded mb-6">
        <div className="px-6 py-4 border-b border-zinc-100">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Informações da loja</p>
        </div>
        <form onSubmit={handleSaveLoja} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Nome da loja</label>
              <input
                type="text"
                value={loja.nome}
                onChange={(e) => setLoja({ ...loja, nome: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">E-mail de contato</label>
              <input
                type="email"
                value={loja.email}
                onChange={(e) => setLoja({ ...loja, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Telefone</label>
              <input
                type="text"
                value={loja.telefone}
                onChange={(e) => setLoja({ ...loja, telefone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">CNPJ</label>
              <input
                type="text"
                placeholder="00.000.000/0000-00"
                value={loja.cnpj}
                onChange={(e) => setLoja({ ...loja, cnpj: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Descrição da loja</label>
            <textarea
              rows={3}
              value={loja.descricao}
              onChange={(e) => setLoja({ ...loja, descricao: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2 rounded hover:bg-zinc-700 transition-colors"
            >
              Salvar alterações
            </button>
            {saved && <span className="text-sm text-emerald-600 font-medium">Salvo!</span>}
          </div>
        </form>
      </div>

      {/* Alterar senha admin */}
      <div className="bg-white border border-zinc-200 rounded mb-6">
        <div className="px-6 py-4 border-b border-zinc-100">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Senha do administrador</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Senha atual</label>
            <input
              type="password"
              value={senha.atual}
              onChange={(e) => setSenha({ ...senha, atual: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Nova senha</label>
              <input
                type="password"
                value={senha.nova}
                onChange={(e) => setSenha({ ...senha, nova: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Confirmar nova senha</label>
              <input
                type="password"
                value={senha.confirmar}
                onChange={(e) => setSenha({ ...senha, confirmar: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>
          </div>
          <button className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2 rounded hover:bg-zinc-700 transition-colors">
            Atualizar senha
          </button>
        </div>
      </div>

      {/* Frete */}
      <div className="bg-white border border-zinc-200 rounded">
        <div className="px-6 py-4 border-b border-zinc-100">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Frete grátis</p>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-zinc-600 mb-4">Defina o valor mínimo para frete grátis em todo o Brasil.</p>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">R$</span>
              <input
                type="number"
                defaultValue={299}
                className="pl-9 pr-4 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400 w-36"
              />
            </div>
            <button className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2 rounded hover:bg-zinc-700 transition-colors">
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
