import dynamic from 'next/dynamic'
import Head from 'next/head'

const FormBuilderApp = dynamic(() => import('../components/FormBuilderApp'), { ssr: false })

export default function Home(){
  return (
    <>
      <Head>
        <title>FormBuilder voor TOPdesk</title>
      </Head>
      <FormBuilderApp />
    </>
  )
}
