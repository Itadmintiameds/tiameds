import PlaceholderPage from '../../components/PlaceholderPage'

interface IParams {
    id: string
}

const page = ({ params }: { params: IParams }) => {
    return (
        <PlaceholderPage
            eyebrow="Case Studies"
            title={params.id}
            message="This is a dynamic page"
            back={{ href: '/casestudies', label: 'Back to case studies' }}
        />
    )
}

export default page
