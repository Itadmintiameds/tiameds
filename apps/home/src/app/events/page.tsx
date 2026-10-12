import PlaceholderPage from '../components/PlaceholderPage'

const page = () => {
    return (
        <PlaceholderPage
            eyebrow="Events"
            title="Events"
            message="This is a dynamic page"
            back={{ href: '/', label: 'Back to home' }}
        />
    )
}

export default page
