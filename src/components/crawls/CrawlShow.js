import React from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import CrawlMap from './CrawlMap'
import CrawlSlider from './CrawlSlider'
import CommentsForm from './CommentsForm'
import LoginRequest from '../common/LoginRequest'
import Auth from '../../lib/Auth'

import mapboxgl from '../../lib/mapbox-gl'

class CrawlShow extends React.Component {
  constructor() {
    super()

    this.state = {
      data: {
        content: ''
      },
      errors: {},
      search: ''
    }
    this.deleteCrawl = this.deleteCrawl.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentDidMount() {
    axios.get(`/api/crawls/${this.props.match.params.id}`)
      .then(res => {
        const bounds = new mapboxgl.LngLatBounds()
        res.data.stops.forEach(stop => {
          const { lng, lat } = stop.bar
          bounds.extend([lng, lat])
        })
        this.setState({ crawl: res.data, zoomCenter: bounds.getCenter() })
      })
  }

  handleChange(e) {
    this.setState({ data: { content: e.target.value } })
  }

  handleSubmit(e){
    e.preventDefault()
    const token = Auth.getToken()
    axios.post(`/api/crawls/${this.props.match.params.id}/comments`, this.state.data, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        const comments = [ res.data, ...this.state.crawl.comments ]
        const crawl = { ...this.state.crawl, comments }
        this.setState({ crawl })
      })
      .catch(err => {
        alert(err.response.data)
      })
  }

  deleteCrawl(e){
    e.preventDefault()
    const token = Auth.getToken()
    const userId = Auth.getUserID()
    axios.delete(`/api/crawls/${this.props.match.params.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => this.props.history.push(`/users/${userId}`))
      .catch(err => this.setState({ errors: err.response.data }))
  }

  render(){
    if (!this.state.crawl) return null

    const {
      comments,
      creator,
      description,
      name

    } = this.state.crawl
    return(
      <main>
        <section className="section">
          <div className="container">
            <h1 className="title is-2">{name}</h1>
            <article className="level">

              <div className="image-username">
                <Link to={`/users/${creator.id}`}>
                  <div style={{backgroundImage: `url(${creator.image})`}}className="user-image-home"/>
                </Link>

                <div className="padding-right">
                  <strong>By @{creator.username}</strong>
                </div>
                {description}

              </div>
            </article>
          </div>
        </section>

        <CrawlMap
          stops={this.state.crawl.stops}
          center={this.state.zoomCenter}
          zoom={12.0}
        />

        <div className="container">
          <section className="section slider-section">
            <h2 className="title is-4 center">Bars on this crawl</h2>
            <CrawlSlider
              stops = {this.state.crawl.stops}
            />
          </section>
        </div>

        <div className="container">
          <section className="card comments">
            <div className="card-header">
              <p className="card-header-title">Comments</p>
            </div>
            {
              comments.length === 0 ?
                <div className="card-content">
                  <h1 className="subtitle is-5">
                  No comments of this bar crawl yet... Add one! 🍻
                  </h1>
                </div>
                :
                <div className="card-content">
                  {comments.map(comment =>
                    <div key={comment.id}>
                      <p><strong>{comment.author}</strong></p>
                      <p className="comment-body">{comment.content}</p>
                      <hr />
                    </div>
                  )}
                </div>
            }
          </section>

          {Auth.isAuthenticated()?
            <CommentsForm
              data={this.state.data}
              handleChange={this.handleChange}
              handleSubmit={this.handleSubmit}
            />
            :
            <section>
              <LoginRequest />
            </section>
          }

        </div>

        {Auth.isAuthenticated() && (creator.id === Auth.getUserID()) &&

        <form className="center">
          <button onClick={(e) => this.deleteCrawl(e)} className="button button-styled-delete center">Delete Crawl</button>
        </form>
        }
      </main>
    )
  }
}

export default CrawlShow
