import React, { Component } from 'react';

import './assets/css/AutoComplete.css';
import { ReactComponent as IconSearch } from './assets/svg/search.svg';
import { ReactComponent as IconX } from './assets/svg/x.svg';
import { ReactComponent as IconChevronsDown } from './assets/svg/chevrons-down.svg';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import SearchInput from './SearchInput';
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
        initialMaxSuggestions: 5,
        maxSuggestions: this.initialMaxSuggestions,
        meta: {
            errorDefault: 'Something went wrong',
            errorNotFound: 'Nothing found',
            dateFormat: 'lt-LT',
            dropdownStartingTip: 'Type 3 characters',
            dropdownMoreText: 'View more',
            searchInputLabel: "Search NASA's images"
        }
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
        const { errorDefault, errorNotFound } = this.state.meta;

        try {
            const res = await fetch(this.constructURL(query));
            if (res.status !== 200 && res.status !== 201) {
                throw new Error(errorDefault);
            }

            const {
                collection: { items }
            } = await res.json();

            if (!items.length) {
                throw new Error(errorNotFound);
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

    suggestionToSelect = ({
        data: [{ nasa_id, title, description, date_created }],
        links: [{ href }]
    }) => {
        const suggestionToSelect = {};

        suggestionToSelect.nasaId = nasa_id;
        suggestionToSelect.title = title;
        suggestionToSelect.description = description;
        suggestionToSelect.date = new Date(date_created).toLocaleDateString(
            this.state.meta.dateFormat
        );
        suggestionToSelect.img = href;

        return suggestionToSelect;
    };

    selectSuggestion = (suggestion, cursor) => {
        this.setState({
            searchInput: suggestion.title,
            selectedSuggestion: suggestion,
            cursor: cursor,
            hideAutoComplete: true
        });
    };

    onKeyDown = ({ keyCode }) => {
        const { suggestions, cursor, maxSuggestions } = this.state;

        switch (keyCode) {
            case 13:
                if (!suggestions.length) return;
                const suggestion = this.suggestionToSelect(suggestions[cursor]);
                this.selectSuggestion(suggestion, cursor);
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

        return suggestions.map((suggestion, i) => {
            const suggestionToSelect = this.suggestionToSelect(suggestion);

            return (
                <Suggestion
                    key={suggestionToSelect.nasaId}
                    suggestion={suggestionToSelect}
                    cursor={i}
                    selectSuggestion={this.selectSuggestion}
                    className={cursor === i ? 'active' : ''}
                />
            );
        });
    };

    resetSuggestions = () => {
        this.setState({
            suggestions: [],
            searchInput: '',
            error: '',
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
        const {
            suggestions,
            maxSuggestions,
            searchInput,
            loading,
            error,
            meta: { dropdownStartingTip, dropdownMoreText }
        } = this.state;

        if (loading || error) {
            return;
        }
        if (!suggestions.length && searchInput.length < 3) {
            return <li>{dropdownStartingTip}</li>;
        }
        if (suggestions.length > maxSuggestions) {
            return (
                <li onClick={this.handleViewMore} className="view-more">
                    <IconChevronsDown className="input__icon--down" />
                    <p>{dropdownMoreText}</p>
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
        return (
            <>
                <form onSubmit={this.handleSubmit}>
                    <div ref={node => (this.node = node)} className="input-group">
                        <IconSearch className="input__icon--main" />

                        {this.state.searchInput && (
                            <IconX onClick={this.resetSuggestions} className="input__icon--reset" />
                        )}

                        <SearchInput
                            name="searchInput"
                            label={this.state.meta.searchInputLabel}
                            value={this.state.searchInput}
                            onChange={this.handleInputChange}
                            onKeyDown={this.onKeyDown}
                        />

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
