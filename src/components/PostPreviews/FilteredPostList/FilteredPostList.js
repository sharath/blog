import React, {Component} from 'react';
import {PostStore} from '../../../data/resource/post';
import PostList from '../PostList/PostList';
import {TagStore} from '../../../data/resource/tag';

import PropTypes from 'prop-types';
import ItemSelector from './ItemSelector/ItemSelector'

import styles from './FilteredPostList.module.css'
import {debounce} from "../../util/debounce";
import * as qs from 'qs'

class FilteredPostList extends Component {
    updatePostSearch = debounce(300, () => {
        this.updatePosts()
    });

    constructor(props) {
        super(props);
        let tags = [];

        this.state = {
            tags: tags,
            loading: true,
            filter: [],
            search: ''
        };

        TagStore.getAll().then((tags) => {
            this.setState({
                tags,
                loading: false
            });
        });

        this.changeTagFilter = this.changeTagFilter.bind(this);
        this.updatePosts = this.updatePosts.bind(this);
        this.changeSearch = this.changeSearch.bind(this);

        this.updatePosts();
    }

    updatePosts() {
        let tagIds = this.state.filter.map(e => e.id);
        PostStore.query({
            tags: tagIds,
            search: this.state.search
        }).then(e => {
            this.setState({
                posts: e
            });
        }).catch(console.error);

        this.props.history.push(`/blog/tag/${tagIds.join(',')}` + ((this.state.search && this.state.search.length > 0) ? `?${qs.stringify({search: this.state.search})}` : ''))
    };

    componentDidMount() {
        let search = (this.props.location && this.props.location.search) ? qs.parse(this.props.location.search)['?search'] : '';
        this.setState({search}, this.updatePosts);

        let query = this.props.match.params;
        if (query.tags) {
            let tags = query.tags.split(',');
            let p = [];
            tags.forEach(e => {
                p.push(TagStore.getById(e));
            });

            Promise.all(p).then((tags) => {
                this.setState({
                    filter: tags,
                }, this.updatePosts())
            });
        }
    }

    changeTagFilter(tags) {
        this.setState({
            filter: tags ? tags : []
        }, this.updatePosts);
    }

    render() {
        return (
            <>
                <div className={styles.filters}>
                    <span className={styles.filterText}>Filters: </span>
                    <div className={styles.filter}>
                        <input className={styles.search} type={"text"} placeholder={"Search"} value={this.state.search}
                               onChange={this.changeSearch}/>
                    </div>
                    <ItemSelector tags={this.state.tags}
                                  loading={this.state.loading}
                                  placeholder={"Tags"}
                                  value={this.state.filter}
                                  className={styles.filter}
                                  onChange={this.changeTagFilter}/>
                </div>
                <PostList posts={this.state.posts}/>
            </>
        );
    }

    changeSearch(e) {
        this.setState({search: e.target.value}, this.updatePostSearch);
    }
}


FilteredPostList.propTypes = {
    query: PropTypes.any,
    filter: PropTypes.func
};

export default FilteredPostList;