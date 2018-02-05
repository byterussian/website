import React from 'react'
import bem from 'utils/bem'

import { Wrap, button, Space, Text } from 'blocks'
import './style.sass'

import logo from 'images/logo.svg'

const b = bem.lock('MobileNavbar')

class Group extends React.Component {
  constructor(props) {
    super(props);
    this.state = { active: false };
  }

  handleToggle() {
    this.setState({ active: !this.state.active });
  }

  render() {
    const { children, name } = this.props;

    return (
      <div className={b('group', { active: this.state.active })}>
        <button className={b('group-handle')} onClick={this.handleToggle.bind(this)}>
          {name}
        </button>
        {
          this.state.active &&
            <div className={b('group-content')}>
              {children}
            </div>
        }
      </div>
    );
  }
}

class MobileNavbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { active: false };
  }

  handleToggle() {
    document.body.classList.toggle('no-scroll', !this.state.active)

    this.setState({
      active: !this.state.active
    });
  }

  componentDidMount() {
    if (this.props.history) {
      this.unlisten = this.props.history.listen((location, action) => {
        document.body.classList.toggle('no-scroll', false)
        this.setState({ active: false });
      });
    }
  }

  componentWillUnmount() {
    this.unlisten && this.unlisten();
  }

  render() {
    const { linkComponent: Link } = this.props;

    return (
      <div className={b()}>
        <div className={b('bar')}>
          <div className={b('logo-container')}>
            <Link className={b('logo')} to="/">
              <img src={logo} alt="DatoCMS" />
            </Link>
          </div>
          <div className={b('hamburger-container')}>
            <button onClick={this.handleToggle.bind(this)}>
              Menu
            </button>
          </div>
        </div>
        <div className={b('menu', { active: this.state.active })}>
          <Link className={b('menu-item')} to="/features/">
            Features
          </Link>
          <Link className={b('menu-item')} to="/use-cases/">
            Use cases
          </Link>
          <Link className={b('menu-item')} to="/pricing/">
            Pricing
          </Link>
          <Link className={b('menu-item')} to="/docs/">
            Learn
          </Link>
          <Link className={b('menu-item')} to="/blog/">
            Blog
          </Link>
          <Group name="Support">
            <Link className={b('group-item')} to="http://support.datocms.com/support/tickets/new">
              Ticket Center
            </Link>
            <Link className={b('group-item')} to="http://support.datocms.com/support/discussions/forums/35000119870">
              Feature Requests
            </Link>
            <Link className={b('group-item')} to="http://slack.datocms.com/">
              Slack Community
            </Link>
          </Group>
          <div className={b('actions')}>
            <a className={button({ border: true })} href="https://dashboard.datocms.com/sign_in">
              Login
            </a>
            <a className={button({ red: true })} href="https://dashboard.datocms.com/register">
              Try it for free
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default MobileNavbar;

