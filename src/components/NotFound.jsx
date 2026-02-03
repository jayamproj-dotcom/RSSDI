import "./NotFound.css"
import { Heart, Home, Phone, Search, ArrowLeft } from "lucide-react"

const NotFound = () => {
    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <div className="not-error-icon">
                    <Heart className="heart-icon" />
                    <span className="not-error-code">404</span>
                </div>

                <h1>Page Not Found</h1>

                <p className="not-error-message">
                    We couldn't find the page you were looking for. Our team is here to help you find what you need.
                </p>

                <div className="not-search-container">
                    <div className="not-search-box">
                        <Search className="not-search-icon" />
                        <input type="text" placeholder="Search for services, doctors, etc." className="not-input"/>
                        <button className="search-button">Search</button>
                    </div>
                </div>

                <div className="not-navigation-options">
                    <a href="/" className="not-nav-option">
                        <Home />
                        <span>Homepage</span>
                    </a>
                    <a href="/services" className="not-nav-option">
                        <ArrowLeft />
                        <span>Go Back</span>
                    </a>
                    <a href="/contact" className="not-nav-option">
                        <Phone />
                        <span>Contact Us</span>
                    </a>
                </div>
            </div>
        </div>
    )
}

export default NotFound
