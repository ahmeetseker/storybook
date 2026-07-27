import type { Meta, StoryObj } from '@storybook/react-vite'
import { FavoritesWorkspace } from './FavoritesWorkspace'
const meta={title:'Pazar Yeri/Favoriler/FavoritesWorkspace',component:FavoritesWorkspace,parameters:{layout:'fullscreen'},tags:['autodocs']} satisfies Meta<typeof FavoritesWorkspace>
export default meta
type Story=StoryObj<typeof meta>
export const Default:Story={}
export const EnterprisePortfolio:Story={name:'AI portföy takip çalışma alanı'}
