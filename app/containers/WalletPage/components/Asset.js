// @flow
import React, { PureComponent } from 'react';
import classNames from 'classnames';
// import QRCode from 'qrcode.react';
// import Avatar from '@material-ui/core/Avatar';
// import IconButton from '@material-ui/core/IconButton';
// import { FormattedMessage } from 'react-intl';
import { withStyles } from '@material-ui/core/styles';
// import Grid from '@material-ui/core/Grid';
// import LinearProgress from '@material-ui/core/LinearProgress';
// import MoreVertIcon from '@material-ui/icons/MoreVert';
// import ExpansionPanel from '@material-ui/core/ExpansionPanel';
// import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
// import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
// import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import Typography from '@material-ui/core/Typography';
// import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
// import FileCopyIcon from '@material-ui/icons/FileCopy';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
// import Divider from '@material-ui/core/Divider';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
// import IconButton from '@material-ui/core/IconButton';
// import FavoriteIcon from '@material-ui/icons/Favorite';
// import ShareIcon from '@material-ui/icons/Share';
import Collapse from '@material-ui/core/Collapse';
// import Avatar from '@material-ui/core/Avatar';
// import MoreVertIcon from '@material-ui/icons/MoreVert';
// import PaymentIcon from '@material-ui/icons/Payment';
// import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

import { required, requiredNumber } from '../../../components/Form/helper';
import validate from '../../../components/Form/validate';
import { getCoinIcon } from '../../../components/CryptoIcons';
import clipboardCopy from '../../../utils/clipboard-copy';
import { covertSymbolToName } from '../../../utils/coin';

const debug = require('debug')('dicoapp:containers:WalletPage:Asset');

export const lessThan = (value: mixed, props: mixed) =>
  new Promise((resolve, reject) => {
    const { balance } = props;
    const n = Number(value);
    const b = Number(balance);
    if (n >= b) {
      return reject(new Error('Value is large than balance'));
    }
    return resolve(true);
  });

export const notSameAddress = (value: mixed, props: mixed) =>
  new Promise((resolve, reject) => {
    const { address } = props;
    if (address.trim() === value.trim()) {
      return reject(new Error('You can not withdraw same address'));
    }
    return resolve(true);
  });

// eslint-disable-next-line react/prop-types
const TextInput = ({ onChange, value, error, isError, ...props }) => (
  <TextField
    {...props}
    error={isError}
    helperText={error}
    value={value}
    onChange={onChange}
  />
);

// eslint-disable-next-line no-unused-vars
const ValidationAmountInput = validate(TextInput, [requiredNumber, lessThan], {
  onChange: true
});

// eslint-disable-next-line no-unused-vars
const ValidationAddressInput = validate(TextInput, [required, notSameAddress], {
  onChange: true
});

const styles = theme => ({
  column: {
    flexBasis: '33.33%'
  },
  details: {
    display: 'block'
  },

  formItem: {
    margin: '0 0 17px 0',
    position: 'relative',
    width: '100%',
    maxWidth: 450
  },
  rightIcon: {
    top: 23
  },
  bitcoinContainer: {
    width: '100%'
  },
  bitcoinTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  bitcoinQRCodeContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'no-wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  bitcoinQRCodeItem: {
    marginRight: 10
  },
  transactionsForm: {
    width: '100%',
    maxWidth: 450
  },
  rightLogo: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexWrap: 'no-wrap',
    alignItems: 'center'
  },
  coinName: {
    paddingLeft: 5
  },

  leftIcon: {
    marginRight: theme.spacing.unit
  },
  iconSmall: {
    fontSize: 20
  },

  withdraw__button: {
    boxShadow: 'none'
  },

  withdraw__form: {
    // marginBottom: 20
  },

  actions: {
    display: 'flex'
  },

  wallet__headerAction: {
    margin: '0 auto'
  },

  wallet__balance: {
    color: 'rgba(0, 0, 0, 0.74)',
    fontSize: '1.725rem',
    fontWeight: 400,
    lineHeight: 1.17,
    letterSpacing: '0.00735em',
    marginBottom: 0
  },

  wallet__content: {
    paddingTop: 8,
    paddingBottom: 8
  },

  wallet__title: {
    lineHeight: '1.31429em',
    fontSize: '1.3125rem'
  },

  wallet__subheader: {
    lineHeight: '1.31429em'
  },

  wallet__button: {
    boxShadow: 'none',
    color: 'rgba(0, 0, 0, 0.54)',
    fontWeight: 400,
    '&:hover': {
      color: theme.palette.primary.main,
      fontWeight: 500
    }
  }
});

type Props = {
  // eslint-disable-next-line flowtype/no-weak-types
  classes: Object,
  // eslint-disable-next-line flowtype/no-weak-types
  data: Object,
  // eslint-disable-next-line flowtype/no-weak-types
  dispatchLoadWithdraw: Function,
  // eslint-disable-next-line flowtype/no-weak-types
  openWithdraw: Function,
  // eslint-disable-next-line flowtype/no-weak-types
  openDeposit: Function
};

type State = {
  expanded: boolean
};

class Asset extends PureComponent<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      expanded: false
    };
    this.amountInput = React.createRef();
    this.addressInput = React.createRef();
  }

  getSnapshotBeforeUpdate(prevProps) {
    // eslint-disable-next-line react/destructuring-assignment
    const currData = this.props.data;
    const prevData = prevProps.data;
    const currLoading = currData.get('loading');
    const prevLoading = prevData.get('loading');
    const currError = currData.get('error');
    return {
      done: currLoading === false && prevLoading === true && currError === false
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot && snapshot.done) {
      // reset input
      const amountInput = this.amountInput.current;
      const addressInput = this.addressInput.current;
      amountInput.reset();
      addressInput.reset();
    }
  }

  handleWithdraw = async (evt: SyntheticInputEvent<>) => {
    evt.preventDefault();
    const { dispatchLoadWithdraw, data } = this.props;
    const coin = data.get('coin');

    try {
      const amountInput = this.amountInput.current;
      const amount = await amountInput.value();

      const addressInput = this.addressInput.current;
      const address = await addressInput.value();

      dispatchLoadWithdraw({
        amount: Number(amount),
        address,
        coin
      });
    } catch (err) {
      debug(`handleWithdraw ${err.message}`);
    }
  };

  copyAddressToClipboard = async (evt: SyntheticInputEvent<>) => {
    evt.stopPropagation();
    const { data } = this.props;
    const address = data.get('address');
    clipboardCopy(address);
    // const success = clipboardCopy(address);
    // if (success) {
    // } else {
    // }
    evt.target.focus();
  };

  toggleExpansionPanel = (evt: SyntheticInputEvent<>) => {
    evt.preventDefault();
    this.setState(prevState => ({
      expanded: !prevState.expanded
    }));
  };

  openWithdraw = (evt: SyntheticInputEvent<>) => {
    evt.preventDefault();
    const { openWithdraw, data } = this.props;
    const coin = data.get('coin');
    openWithdraw(coin);
  };

  openDeposit = (evt: SyntheticInputEvent<>) => {
    evt.preventDefault();
    const { openDeposit, data } = this.props;
    const coin = data.get('coin');
    openDeposit(coin);
  };

  render() {
    debug(`render`);

    const { classes, data, openWithdraw, openDeposit } = this.props;
    const { expanded } = this.state;
    const loading = data.get('loading');
    const CIcon = getCoinIcon(data.get('coin'));

    return (
      <Card>
        <CardHeader
          classes={{
            action: classes.wallet__headerAction,
            title: classes.wallet__title,
            subheader: classes.wallet__subheader
          }}
          action={CIcon}
          title={covertSymbolToName(data.get('coin'))}
          subheader={data.get('coin')}
        />
        <CardContent className={classes.wallet__content}>
          <Typography
            variant="display4"
            gutterBottom
            className={classes.wallet__balance}
          >
            {data.get('balance')} {data.get('coin')}
          </Typography>
        </CardContent>
        <CardActions className={classes.actions} disableActionSpacing>
          <Button
            className={classes.wallet__button}
            size="small"
            color="primary"
            onClick={this.openDeposit}
          >
            <KeyboardArrowUpIcon
              className={classNames(classes.leftIcon, classes.iconSmall)}
            />
            Deposit
          </Button>
          <Button
            className={classes.wallet__button}
            size="small"
            color="primary"
            onClick={this.openWithdraw}
          >
            <KeyboardArrowDownIcon
              className={classNames(classes.leftIcon, classes.iconSmall)}
            />
            Withdraw
          </Button>
        </CardActions>
      </Card>
    );
  }
}

Asset.displayName = 'Asset';

export default withStyles(styles)(Asset);