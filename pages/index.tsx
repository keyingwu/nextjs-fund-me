import Head from "next/head"
import Image from "next/image"
import styles from "../styles/Home.module.css"
import Header from "../components/Header"
import FundMe from "../components/FundMe"

export default function Home() {
    return (
        <div className={styles.container}>
            <Head>
                <title>Smart Contract Fund Me</title>
                <meta name="description" content=">Smart Contract Fund Me" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            <FundMe />
        </div>
    )
}
