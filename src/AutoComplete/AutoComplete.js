import React, { Component } from 'react';

import './assets/css/AutoComplete.css';
import { ReactComponent as IconSearch } from './assets/svg/search.svg';
import { ReactComponent as IconX } from './assets/svg/x.svg';
import { ReactComponent as IconChevronsDown } from './assets/svg/chevrons-down.svg';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import Suggestion from './Suggestion';
import SelectedSuggestion from './SelectedSuggestion';

class AutoComplete extends Component {
    state = {
        searchInput: '',
        suggestions: [],
        selectedSuggestion: null,
        hideAutoComplete: true,
        loading: false,
        error: '',
        cursor: 0,
        minChars: 3,
        maxSuggestions: this.initialMaxSuggestions,
        initialMaxSuggestions: 5
    };

    constructURL = query => {
        const API = {
            url: 'https://images-api.nasa.gov',
            media_type: 'image'
        };
        const { url, media_type } = API;

        return `${url}/search?media_type=${media_type}&q=${query}`;
    };

    getSuggestions = async query => {
        try {
            const res = await fetch(this.constructURL(query));
            if (res.status !== 200 && res.status !== 201) {
                throw new Error('Something went wrong');
            }

            const {
                collection: { items }
            } = await res.json();

            if (!items.length) {
                throw new Error('Nothing found');
            }

            return this.setState({ suggestions: items, loading: false, error: '' });
        } catch ({ message }) {
            return this.setState({ error: message, loading: false });
        }
    };

    handleInputChange = ({ target: { name, value } }) => {
        this.setState(
            {
                [name]: value,
                cursor: 0,
                maxSuggestions: this.state.initialMaxSuggestions
            },
            this.handleSuggestions
        );
    };

    handleSuggestions = () => {
        let { searchInput, minChars } = this.state;
        searchInput = searchInput.trim();

        if (searchInput && searchInput.length >= minChars) {
            this.setState({ loading: true }, () => this.getSuggestions(searchInput));
        } else {
            this.setState({ suggestions: [], loading: false, error: '' });
        }
    };

    handleSubmit = e => {
        e.preventDefault();
    };

    selectSuggestion = suggestion => {
        this.setState({
            searchInput: suggestion.title,
            selectedSuggestion: suggestion,
            hideAutoComplete: true
        });
    };

    onKeyDown = ({ keyCode }) => {
        const { suggestions, cursor, maxSuggestions } = this.state;

        switch (keyCode) {
            case 13:
                if (!suggestions.length) return this.handleSubmit;
                this.setState({
                    searchInput: suggestions[cursor].data[0].title,
                    suggestions: [],
                    cursor: 0
                });
                break;
            case 38:
                if (cursor === 0) return;
                this.setState(prevState => ({
                    cursor: prevState.cursor - 1
                }));
                break;
            case 40:
                if (cursor + 1 === maxSuggestions || cursor + 1 === suggestions.length) return;
                this.setState(prevState => ({
                    cursor: prevState.cursor + 1
                }));
                break;
            default:
                return;
        }
    };

    renderSuggestions = () => {
        let { suggestions, loading, error, cursor, maxSuggestions } = this.state;

        if (loading)
            return (
                <li>
                    <Spinner />
                </li>
            );
        if (error)
            return (
                <li>
                    <ErrorMessage error={error} />
                </li>
            );

        if (suggestions && suggestions.length > maxSuggestions) {
            suggestions = suggestions.slice(0, maxSuggestions);
        }

        return suggestions.map(
            ({ data: [{ nasa_id, title, description, date_created }], links: [{ href }] }, i) => (
                <Suggestion
                    key={nasa_id}
                    nasaId={nasa_id}
                    title={title}
                    description={description}
                    date={new Date(date_created).toLocaleDateString('lt-LT')}
                    img={href}
                    selectSuggestion={this.selectSuggestion}
                    className={cursor === i ? 'active' : ''}
                />
            )
        );
    };

    resetSuggestions = () => {
        this.setState({
            suggestions: [],
            searchInput: '',
            selectedSuggestion: null,
            maxSuggestions: this.state.initialMaxSuggestions,
            hideAutoComplete: true
        });
    };

    componentDidMount = () => {
        document.addEventListener('mouseup', this.handleSuggestionsHide);
    };

    componentWillUnmount = () => {
        document.removeEventListener('mouseup', this.handleSuggestionsHide);
    };

    handleSuggestionsHide = ({ target }) => {
        if (this.node.contains(target)) {
            this.setState({ hideAutoComplete: false });
        } else {
            this.setState({ hideAutoComplete: true });
        }
    };

    handleViewMore = () => {
        this.setState(prevState => ({
            maxSuggestions: prevState.maxSuggestions + this.state.initialMaxSuggestions
        }));
    };

    renderViewMore = () => {
        const { suggestions, maxSuggestions, searchInput, loading, error } = this.state;
        if (loading || error) {
            return;
        }
        if (!suggestions.length && searchInput.length < 3) {
            return <li>Type 3 characters</li>;
        }
        if (suggestions.length > maxSuggestions) {
            return (
                <li onClick={this.handleViewMore} className="view-more">
                    <IconChevronsDown className="input__icon--down" />
                    <p>View more</p>
                </li>
            );
        }
    };

    renderSelectedSuggestion = () => {
        const { selectedSuggestion } = this.state;

        if (selectedSuggestion) {
            return <SelectedSuggestion selectedSuggestion={selectedSuggestion} />;
        }
    };

    render() {
        console.log(this.state.selectedSuggestion);
        return (
            <>
                <form onSubmit={this.handleSubmit}>
                    <div ref={node => (this.node = node)} className="input-group">
                        <IconSearch className="input__icon--main" />
                        {this.state.searchInput && (
                            <IconX onClick={this.resetSuggestions} className="input__icon--reset" />
                        )}

                        <input
                            autoComplete="off"
                            spellCheck="false"
                            required
                            type="text"
                            id="movie"
                            name="searchInput"
                            value={this.state.searchInput}
                            onChange={this.handleInputChange}
                            onKeyDown={this.onKeyDown}
                        />
                        <label htmlFor="movie">Search NASA's images</label>

                        <ul className={this.state.hideAutoComplete ? 'hide' : ''}>
                            {this.renderSuggestions()}
                            {this.renderViewMore()}
                        </ul>
                    </div>
                </form>
                {this.renderSelectedSuggestion()}
            </>
        );
    }
}

export default AutoComplete;
