// Import Viem modules.
import { optimismPortal2Abi } from '@/optimismPortal2Abi'
import {
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  http,
} from 'viem'
import { mainnet, optimism } from 'viem/chains'
import {
  publicActionsL1,
  publicActionsL2,
  walletActionsL1,
  walletActionsL2,
} from 'viem/op-stack'

export const publicClientL1 = createPublicClient({
  chain: mainnet,
  transport: http(),
}).extend(publicActionsL1())

export const walletClientL1 = createWalletClient({
  chain: mainnet,
  transport: http(),
}).extend(walletActionsL1())

export const publicClientL2 = createPublicClient({
  chain: optimism,
  transport: http(),
}).extend(publicActionsL2())

export const walletClientL2 = createWalletClient({
  chain: optimism,
  transport: http(),
}).extend(walletActionsL2())

// (Shortcut) Get receipt from transaction created in Step 1.
const receipt = await publicClientL2.getTransactionReceipt({ hash: '0x...' })

// 1. Wait until the withdrawal is ready to prove.
const { output, withdrawal } = await publicClientL1.waitToProve({
  receipt,
  targetChain: walletClientL2.chain,
})

// 2. Build parameters to prove the withdrawal on the L2.
const proveArgs = await publicClientL2.buildProveWithdrawal({
  output,
  withdrawal,
})

const functionData = encodeFunctionData({
  abi: optimismPortal2Abi,
  functionName: 'proveWithdrawalTransaction',
  args: [
    proveArgs.withdrawal,
    proveArgs.l2OutputIndex,
    proveArgs.outputRootProof,
    proveArgs.withdrawalProof,
  ],
})

// tx to send
// {
//   to: optimismPortal2Address, // for the chain's portal contract
//   data: functionData,
// }
