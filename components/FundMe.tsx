import { useWeb3Contract, useMoralis } from "react-moralis"
import { useNotification } from "web3uikit"
import { abi, contractAddresses } from "../constants"
import { useEffect, useState } from "react"
import { BigNumber, ethers, ContractTransaction } from "ethers"

export default function FundMe() {
    const addresses: any = contractAddresses
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId: string = parseInt(chainIdHex!).toString()
    const fundMeAddress = chainId in addresses ? addresses[chainId][0] : null
    console.log(`chainId: ${chainId}, contract address: ${fundMeAddress}`)
    const [minimumUSD, setMinimumUSD] = useState("0")
    const [funders, setFunders] = useState([""])
    const [fundAmount, setFundAmount] = useState("0")
    console.log(`Funders: ${funders}`)
    const [balance, setBalance] = useState("0")

    const dispatch = useNotification()

    const {
        runContractFunction: fund,
        isLoading: isLoadingFund,
        isFetching: isFetchingFund,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: fundMeAddress!,
        functionName: "fund",
        params: {},
        msgValue: ethers.utils.parseEther(fundAmount).toString(),
    })
    const {
        runContractFunction: withdraw,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: fundMeAddress!,
        functionName: "withdraw",
        params: {},
    })
    const { runContractFunction: getMinimumUSD } = useWeb3Contract({
        abi: abi,
        contractAddress: fundMeAddress!,
        functionName: "getMinimumUSD",
        params: {},
    })

    const { runContractFunction: getFunders } = useWeb3Contract({
        abi: abi,
        contractAddress: fundMeAddress!,
        functionName: "getFunders",
        params: {},
    })

    async function updateUI() {
        const minimumUSDFromCall = (
            (await getMinimumUSD()) as BigNumber
        ).toString()
        const funders = (await getFunders()) as Array<string>
        if (typeof window.ethereum !== "undefined") {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            try {
                const balance = await provider.getBalance(fundMeAddress)
                console.log(ethers.utils.formatEther(balance))
                setBalance(balance.toString())
            } catch (error) {
                console.log(error)
            }
        } else {
            handleNotification("Please install Metamask")
        }
        setMinimumUSD(minimumUSDFromCall)
        setFunders(funders)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const handleSuccess = async function (tx: ContractTransaction) {
        await tx.wait(1)
        handleNotification("Transaction Complete")
        updateUI()
    }

    const handleNotification = function (title: string, msg?: string) {
        dispatch({
            type: "info",
            message: typeof msg == "undefined" ? title : msg,
            title: title,
            position: "topR",
            icon: "bell",
        })
    }

    return (
        <div className="p-5">
            Welcome to FUND ME smart contract!
            {fundMeAddress ? (
                <div className="">
                    <div className="flex my-2">
                        <label
                            htmlFor="amount"
                            className="block text-sm font-medium text-gray-700 w-auto"
                        >
                            Make a contribution
                        </label>
                        <input
                            id="amount"
                            name="amount"
                            placeholder="0.1"
                            type="text"
                            className="block ml-2 w-auto rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            onChange={(e) => setFundAmount(e.target.value)}
                        />
                    </div>
                    <button
                        className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 ml-auto mt-2"
                        onClick={async function () {
                            await fund({
                                onSuccess: (tx) =>
                                    handleSuccess(tx as ContractTransaction),
                                onError: (e) => console.log(e),
                                onComplete: () => {
                                    handleNotification("Transaction submitted")
                                },
                            })
                        }}
                        disabled={isLoadingFund || isFetchingFund}
                    >
                        {isLoadingFund || isFetchingFund ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div>Fund Me</div>
                        )}
                    </button>
                    <button
                        className="text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 mt-2 ml-2"
                        onClick={async function () {
                            await withdraw({
                                onSuccess: (tx) =>
                                    handleSuccess(tx as ContractTransaction),
                                onError: (e) => console.log(e),
                                onComplete: () => {
                                    handleNotification("Transaction submitted")
                                },
                            })
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div>Withdraw</div>
                        )}
                    </button>
                    <div className="border-t border-gray-200">
                        <dl>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    Mininum Amount
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                    {ethers.utils.formatUnits(
                                        minimumUSD,
                                        "ether"
                                    )}{" "}
                                    USD
                                </dd>
                            </div>
                        </dl>
                        <dl>
                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    Balance
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                    {ethers.utils.formatUnits(balance, "ether")}{" "}
                                </dd>
                            </div>
                        </dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Funders
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                <ul
                                    role="list"
                                    className="divide-y divide-gray-200 rounded-md border border-gray-200"
                                >
                                    {funders.map((funder) => {
                                        return (
                                            <li className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                                                <div className="flex w-0 flex-1 items-center">
                                                    {funder.toUpperCase()}
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </dd>
                        </div>
                    </div>
                </div>
            ) : (
                <div>No FundMe Address Deteched</div>
            )}
        </div>
    )
}
