// Write your code here
import {Component} from 'react'
import {BsPlusSquare, BsDashSquare} from 'react-icons/bs'
import Loader from 'react-loader-spinner'
import Cookies from 'js-cookie'
import Header from '../Header'
import SimilarProductItem from '../SimilarProductItem'
import './index.css'

const apiStatusConstant = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class ProductItemDetails extends Component {
  state = {
    productData: {},
    similarProducts: [],
    quantity: 1,
    apiStatus: apiStatusConstant.initial,
  }

  componentDidMount() {
    this.getProductDetails()
  }

  getProductDetails = async () => {
    this.setState({apiStatus: apiStatusConstant.inProgress})
    const {match} = this.props
    const {params} = match
    const {id} = params
    console.log(id)
    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = `https://apis.ccbp.in/products/${id}`
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtToken} `,
      },
    }
    const response = await fetch(apiUrl, options)
    if (response.ok === true) {
      const data = await response.json()
      const fetchedData = {
        id: data.id,
        imageUrl: data.image_url,
        title: data.title,
        price: data.price,
        description: data.description,
        brand: data.brand,
        totalReview: data.total_reviews,
        rating: data.rating,
        availability: data.availability,
      }
      console.log(fetchedData)
      const productsData = data.similar_products.map(product => ({
        title: product.title,
        brand: product.brand,
        price: product.price,
        id: product.id,
        imageUrl: product.image_url,
        rating: product.rating,
      }))
      this.setState({
        productData: fetchedData,
        similarProducts: productsData,
        apiStatus: apiStatusConstant.success,
      })
    }
    if (response.status === 404) {
      this.setState({apiStatus: apiStatusConstant.failure})
    }
  }

  onGoBackProducts = () => {
    const {history} = this.props
    history.replace('/products')
  }

  renderSimilarProducts = () => {
    const {similarProducts} = this.state
    return (
      <ul className="similar-product-list">
        {similarProducts.map(product => (
          <SimilarProductItem productDetails={product} key={product.id} />
        ))}
      </ul>
    )
  }

  renderLoadingView = () => (
    <div className="loading-view-container" testid="loader">
      <Loader type="ThreeDots" color="#0b69ff" height="50" width="50" />
    </div>
  )

  renderFailureView = () => (
    <div className="failure-view-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-error-view-img.png"
        alt="failure view"
        className="failure-img"
      />
      <h1 className="heading">Product Not Found</h1>
      <button
        type="button"
        className="continue-btn"
        onClick={this.onGoBackProducts}
      >
        Continue Shopping
      </button>
    </div>
  )

  onItemDecrement = () => {
    const {quantity} = this.state
    if (quantity > 1) {
      this.setState(prevState => ({quantity: prevState.quantity - 1}))
    }
  }

  onItemIncrement = () => {
    this.setState(prevState => ({quantity: prevState.quantity + 1}))
  }

  renderProductsView = () => {
    const {productData, quantity} = this.state
    const {
      id,
      imageUrl,
      title,
      price,
      description,
      brand,
      totalReview,
      rating,
      availability,
    } = productData
    return (
      <>
        <div className="products-container">
          <div className="product-cart">
            <img src={imageUrl} className="img" alt="product" />
            <div className="product-details-container">
              <h1 className="product-title">{title}</h1>
              <p className="price">{`Rs ${price}`}</p>
              <div className="total-reviews">
                <div className="rating-container">
                  <p className="rating">{rating}</p>
                  <img
                    src="https://assets.ccbp.in/frontend/react-js/star-img.png"
                    alt="star"
                    className="star"
                  />
                </div>
                <p className="reviews">{`${totalReview} Reviews`}</p>
              </div>
              <p className="description">{description}</p>
              <p className="available">{`Available: ${availability}`}</p>
              <p className="available">{`Brand: ${brand}`}</p>
              <hr />
              <div className="add-sub-item">
                <button
                  type="button"
                  className="btn"
                  onClick={this.onItemDecrement}
                  testid="minus"
                >
                  <BsDashSquare />
                </button>
                <p className="quantity">{quantity}</p>
                <button
                  type="button"
                  className="btn"
                  onClick={this.onItemIncrement}
                  testid="plus"
                >
                  <BsPlusSquare />
                </button>
              </div>
              <button type="button" className="button">
                ADD TO CART
              </button>
            </div>
          </div>
          {this.renderSimilarProducts()}
        </div>
      </>
    )
  }

  renderViews = () => {
    const {apiStatus} = this.state
    switch (apiStatus) {
      case apiStatusConstant.success:
        return this.renderProductsView()
      case apiStatusConstant.inProgress:
        return this.renderLoadingView()
      case apiStatusConstant.failure:
        return this.renderFailureView()
      default:
        return null
    }
  }

  render() {
    return (
      <>
        <Header />
        <div className="render-view-list">{this.renderViews()}</div>
      </>
    )
  }
}

export default ProductItemDetails
