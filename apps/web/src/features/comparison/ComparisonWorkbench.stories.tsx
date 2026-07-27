import type { Meta, StoryObj } from '@storybook/react-vite'
import { ComparisonWorkbench } from './ComparisonWorkbench'
const meta = { title:'Pazar Yeri/Karşılaştırma/ComparisonWorkbench', component:ComparisonWorkbench, parameters:{layout:'fullscreen'}, tags:['autodocs'] } satisfies Meta<typeof ComparisonWorkbench>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const EnterpriseDecisionWorkspace: Story = { name:'AI karar destek çalışma alanı' }
