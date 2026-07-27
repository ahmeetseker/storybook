import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { RegionDirectoryView } from './RegionDirectoryView'
import { REGIONS } from './data/region-adapter'
import { DEFAULT_REGION_SEARCH_STATE } from './domain/region-search-state'
import { parseRegionPrompt } from './domain/region-ai'
import type { RegionAiProposal, RegionSearchState } from './domain/region-types'
const meta = { title:'Pazar Yeri/Bölgeler/RegionDirectoryView', component:RegionDirectoryView, parameters:{layout:'fullscreen'}, tags:['autodocs'] } as Meta<typeof RegionDirectoryView>
export default meta
type Story = StoryObj<typeof meta>
function Frame({proposal}: {proposal?:RegionAiProposal}) { const [state,setState]=useState<RegionSearchState>(DEFAULT_REGION_SEARCH_STATE); const [selected,setSelected]=useState<string>(); const [compare,setCompare]=useState<string[]>([]); return <RegionDirectoryView state={state} items={REGIONS} status="success" proposal={proposal} selectedId={selected} compareIds={compare} onStateChange={setState} onAiSearch={()=>{}} onSelect={setSelected} onToggleCompare={(id)=>setCompare((ids)=>ids.includes(id)?ids.filter((x)=>x!==id):ids.length<3?[...ids,id]:ids)} onApplyProposal={()=>{}} onDismissProposal={()=>{}}/> }
export const Default: Story = { render:()=> <Frame/> }
export const AiProposal: Story = { render:()=> <Frame proposal={parseRegionPrompt('İzmirde denize yakın imarlı arsa yatırımı')}/> }
export const CityDrilldown: Story = { render:()=> <Frame/> }
export const Loading: Story = { render:()=> <RegionDirectoryView state={DEFAULT_REGION_SEARCH_STATE} items={[]} status="loading" compareIds={[]} onStateChange={()=>{}} onAiSearch={()=>{}} onSelect={()=>{}} onToggleCompare={()=>{}} onApplyProposal={()=>{}} onDismissProposal={()=>{}}/> }
export const Empty: Story = { render:()=> <RegionDirectoryView state={DEFAULT_REGION_SEARCH_STATE} items={[]} status="success" compareIds={[]} onStateChange={()=>{}} onAiSearch={()=>{}} onSelect={()=>{}} onToggleCompare={()=>{}} onApplyProposal={()=>{}} onDismissProposal={()=>{}}/> }
